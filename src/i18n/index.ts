import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  region: string;
  dir?: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', region: 'United States & Global', dir: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', region: 'Spain & Latin America', dir: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', region: 'France & Francophone', dir: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', region: 'Germany & DACH', dir: 'ltr' },
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '中文 (简体)', flag: '🇨🇳', region: 'China & East Asia', dir: 'ltr' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', region: 'Japan', dir: 'ltr' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', region: 'Brazil & Portugal', dir: 'ltr' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', region: 'Eastern Europe & CIS', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', region: 'Middle East & North Africa', dir: 'rtl' },
];

const resources = {
  en: {
    translation: {
      settings: {
        title: "Account Settings",
        subtitle: "Manage your personal credentials, API keys, security protocols, and platform preferences.",
        profileTab: "Profile & KYC",
        securityTab: "Security & MFA",
        notificationsTab: "Notifications",
        preferencesTab: "Preferences",
        languageSectionTitle: "Language & Regional Settings",
        languageSectionSubtitle: "Select your preferred display language for dashboards, notifications, and trading reports.",
        selectLanguageLabel: "Interface Language",
        currentLanguage: "Active Language",
        themeSectionTitle: "Platform Theme & Experience",
        toggleThemeLabel: "Toggle Theme",
        fintechDark: "Fintech Dark Mode",
        fintechDarkDesc: "High contrast, low eye-strain professional deep navy dashboard visual mode.",
        cleanLight: "Clean Light Mode",
        cleanLightDesc: "Bright, high-clarity daylight theme with vibrant blue accents and subtle card borders.",
        dangerProtocols: "Danger Protocols",
        languageUpdated: "Language updated successfully to English",
        active: "Active"
      },
      nav: {
        dashboard: "Dashboard",
        earn: "Earn",
        mining: "Mining",
        liveTrading: "Live Trading",
        wallet: "Wallet",
        support: "Support",
        settings: "Settings",
        profile: "Profile",
        logout: "Logout",
        language: "Language"
      },
      common: {
        save: "Save Changes",
        cancel: "Cancel",
        status: "Status",
        connected: "Connected",
        offline: "Offline",
        active: "Active"
      }
    }
  },
  es: {
    translation: {
      settings: {
        title: "Configuración de Cuenta",
        subtitle: "Administre sus credenciales personales, claves API, protocolos de seguridad y preferencias.",
        profileTab: "Perfil y KYC",
        securityTab: "Seguridad y MFA",
        notificationsTab: "Notificaciones",
        preferencesTab: "Preferencias",
        languageSectionTitle: "Idioma y Configuración Regional",
        languageSectionSubtitle: "Seleccione el idioma preferido para paneles, notificaciones e informes de negociación.",
        selectLanguageLabel: "Idioma de la Interfaz",
        currentLanguage: "Idioma Activo",
        themeSectionTitle: "Tema y Experiencia de Plataforma",
        toggleThemeLabel: "Cambiar Tema",
        fintechDark: "Modo Oscuro Fintech",
        fintechDarkDesc: "Alto contraste y menor fatiga visual en un panel azul marino profesional.",
        cleanLight: "Modo Claro Limpio",
        cleanLightDesc: "Tema diurno brillante con acentos en azul vibrante y bordes definidos.",
        dangerProtocols: "Protocolos de Peligro",
        languageUpdated: "Idioma actualizado con éxito a Español",
        active: "Activo"
      },
      nav: {
        dashboard: "Panel",
        earn: "Ganar",
        mining: "Minería",
        liveTrading: "Trading en Vivo",
        wallet: "Billetera",
        support: "Soporte",
        settings: "Configuración",
        profile: "Perfil",
        logout: "Cerrar Sesión",
        language: "Idioma"
      },
      common: {
        save: "Guardar Cambios",
        cancel: "Cancelar",
        status: "Estado",
        connected: "Conectado",
        offline: "Desconectado",
        active: "Activo"
      }
    }
  },
  fr: {
    translation: {
      settings: {
        title: "Paramètres du Compte",
        subtitle: "Gérez vos identifiants, clés API, protocoles de sécurité et préférences de la plateforme.",
        profileTab: "Profil & KYC",
        securityTab: "Sécurité & MFA",
        notificationsTab: "Notifications",
        preferencesTab: "Préférences",
        languageSectionTitle: "Langue & Paramètres Régionaux",
        languageSectionSubtitle: "Sélectionnez votre langue d'affichage pour les tableaux de bord et rapports de trading.",
        selectLanguageLabel: "Langue de l'Interface",
        currentLanguage: "Langue Active",
        themeSectionTitle: "Thème & Expérience",
        toggleThemeLabel: "Changer de Thème",
        fintechDark: "Mode Sombre Fintech",
        fintechDarkDesc: "Contraste élevé et confort visuel optimal avec un bleu marine profond professionnel.",
        cleanLight: "Mode Clair Épuré",
        cleanLightDesc: "Thème diurne lumineux avec des accents bleus vibrants et des bordures subtiles.",
        dangerProtocols: "Protocoles de Danger",
        languageUpdated: "Langue mise à jour en Français",
        active: "Actif"
      },
      nav: {
        dashboard: "Tableau de bord",
        earn: "Gains",
        mining: "Minage",
        liveTrading: "Trading en Direct",
        wallet: "Portefeuille",
        support: "Support",
        settings: "Paramètres",
        profile: "Profil",
        logout: "Déconnexion",
        language: "Langue"
      },
      common: {
        save: "Enregistrer",
        cancel: "Annuler",
        status: "Statut",
        connected: "Connecté",
        offline: "Hors Ligne",
        active: "Actif"
      }
    }
  },
  de: {
    translation: {
      settings: {
        title: "Konto-Einstellungen",
        subtitle: "Verwalten Sie Anmeldedaten, API-Schlüssel, Sicherheitsprotokolle und Einstellungen.",
        profileTab: "Profil & KYC",
        securityTab: "Sicherheit & MFA",
        notificationsTab: "Benachrichtigungen",
        preferencesTab: "Präferenzen",
        languageSectionTitle: "Sprache & Regionale Einstellungen",
        languageSectionSubtitle: "Wählen Sie Ihre bevorzugte Sprache für Dashboards, Benachrichtigungen und Berichte.",
        selectLanguageLabel: "Oberflächensprache",
        currentLanguage: "Aktive Sprache",
        themeSectionTitle: "Design & Plattformerlebnis",
        toggleThemeLabel: "Design Umschalten",
        fintechDark: "Fintech Dunkelmodus",
        fintechDarkDesc: "Kontrastreiches, augenschonendes professionelles Marineblau-Design.",
        cleanLight: "Heller Designmodus",
        cleanLightDesc: "Klares Tageslicht-Design mit lebhaften blauen Akzenten und feinen Rändern.",
        dangerProtocols: "Gefahrenprotokolle",
        languageUpdated: "Sprache erfolgreich auf Deutsch geändert",
        active: "Aktiv"
      },
      nav: {
        dashboard: "Dashboard",
        earn: "Verdienen",
        mining: "Mining",
        liveTrading: "Live-Handel",
        wallet: "Brieftasche",
        support: "Support",
        settings: "Einstellungen",
        profile: "Profil",
        logout: "Abmelden",
        language: "Sprache"
      },
      common: {
        save: "Änderungen speichern",
        cancel: "Abbrechen",
        status: "Status",
        connected: "Verbunden",
        offline: "Offline",
        active: "Aktiv"
      }
    }
  },
  zh: {
    translation: {
      settings: {
        title: "账户设置",
        subtitle: "管理您的个人证明、API 密钥、安全协议及平台偏好设置。",
        profileTab: "个人资料与 KYC",
        securityTab: "安全与 MFA",
        notificationsTab: "通知中心",
        preferencesTab: "偏好设置",
        languageSectionTitle: "语言与地区设置",
        languageSectionSubtitle: "选择您的仪表板、通知及交易报告的首选显示语言。",
        selectLanguageLabel: "界面语言",
        currentLanguage: "当前语言",
        themeSectionTitle: "平台外观与主题",
        toggleThemeLabel: "切换主题",
        fintechDark: "金融科技深色模式",
        fintechDarkDesc: "高对比度、保护视力的专业深蓝主题视图。",
        cleanLight: "极简明亮模式",
        cleanLightDesc: "明亮清晰的日间主题，带有充满活力的蓝色点缀与边框。",
        dangerProtocols: "危险操作协议",
        languageUpdated: "语言已切换为中文",
        active: "激活"
      },
      nav: {
        dashboard: "仪表盘",
        earn: "收益",
        mining: "挖矿",
        liveTrading: "实时交易",
        wallet: "钱包",
        support: "客服支持",
        settings: "设置",
        profile: "个人中心",
        logout: "退出登录",
        language: "语言"
      },
      common: {
        save: "保存更改",
        cancel: "取消",
        status: "状态",
        connected: "已连接",
        offline: "离线",
        active: "激活"
      }
    }
  },
  ja: {
    translation: {
      settings: {
        title: "アカウント設定",
        subtitle: "認証情報、APIキー、セキュリティプロトコル、およびプラットフォーム環境を管理します。",
        profileTab: "プロフィール＆KYC",
        securityTab: "セキュリティ＆MFA",
        notificationsTab: "通知",
        preferencesTab: "個人設定",
        languageSectionTitle: "言語と地域設定",
        languageSectionSubtitle: "ダッシュボードや通知、レポートで使用する言語を選択してください。",
        selectLanguageLabel: "表示言語",
        currentLanguage: "現在の言語",
        themeSectionTitle: "テーマと表示モード",
        toggleThemeLabel: "テーマ切替",
        fintechDark: "フィンテックダークモード",
        fintechDarkDesc: "目に対する負担を軽減する、高コントラストでプロ仕様のネイビーブルーテーマ。",
        cleanLight: "クリーンライトモード",
        cleanLightDesc: "鮮やかなブルーのアクセントと美しいボーダーを備えた明るい日中モード。",
        dangerProtocols: "危険な操作の管理",
        languageUpdated: "言語を日本語に変更しました",
        active: "有効"
      },
      nav: {
        dashboard: "ダッシュボード",
        earn: "収益",
        mining: "マイニング",
        liveTrading: "リアルタイム取引",
        wallet: "ウォレット",
        support: "サポート",
        settings: "設定",
        profile: "プロフィール",
        logout: "ログアウト",
        language: "言語"
      },
      common: {
        save: "変更を保存",
        cancel: "キャンセル",
        status: "ステータス",
        connected: "接続済み",
        offline: "オフライン",
        active: "有効"
      }
    }
  },
  pt: {
    translation: {
      settings: {
        title: "Configurações da Conta",
        subtitle: "Gerencie suas credenciais, chaves API, protocolos de segurança e preferências da plataforma.",
        profileTab: "Perfil & KYC",
        securityTab: "Segurança & MFA",
        notificationsTab: "Notificações",
        preferencesTab: "Preferências",
        languageSectionTitle: "Idioma e Configurações Regionais",
        languageSectionSubtitle: "Selecione o idioma de exibição para painéis, notificações e relatórios de negociação.",
        selectLanguageLabel: "Idioma da Interface",
        currentLanguage: "Idioma Ativo",
        themeSectionTitle: "Tema & Experiência da Plataforma",
        toggleThemeLabel: "Alternar Tema",
        fintechDark: "Modo Escuro Fintech",
        fintechDarkDesc: "Alto contraste, menos fadiga ocular em um painel azul marinho profissional.",
        cleanLight: "Modo Claro Limpo",
        cleanLightDesc: "Tema de dia brilhante com detalhes em azul vibrante e bordas suaves.",
        dangerProtocols: "Protocolos de Perigo",
        languageUpdated: "Idioma alterado para Português",
        active: "Ativo"
      },
      nav: {
        dashboard: "Painel",
        earn: "Ganhar",
        mining: "Mineração",
        liveTrading: "Trading ao Vivo",
        wallet: "Carteira",
        support: "Suporte",
        settings: "Configurações",
        profile: "Perfil",
        logout: "Sair",
        language: "Idioma"
      },
      common: {
        save: "Salvar Alterações",
        cancel: "Cancelar",
        status: "Status",
        connected: "Conectado",
        offline: "Offline",
        active: "Ativo"
      }
    }
  },
  ru: {
    translation: {
      settings: {
        title: "Настройки Аккаунта",
        subtitle: "Управление личными данными, API-ключами, безопасностью и предпочтениями.",
        profileTab: "Профиль и KYC",
        securityTab: "Безопасность и MFA",
        notificationsTab: "Уведомления",
        preferencesTab: "Предпочтения",
        languageSectionTitle: "Язык и Региональные Настройки",
        languageSectionSubtitle: "Выберите предпочтительный язык для панелей, уведомлений и торговых отчетов.",
        selectLanguageLabel: "Язык интерфейса",
        currentLanguage: "Активный язык",
        themeSectionTitle: "Тема и Оформление",
        toggleThemeLabel: "Сменить тему",
        fintechDark: "Темная тема Fintech",
        fintechDarkDesc: "Высокая контрастность, снижающая усталость глаз, в профессиональных темно-синих тонах.",
        cleanLight: "Светлая тема",
        cleanLightDesc: "Яркая дневная тема с насыщенными синими акцентами и четкими границами.",
        dangerProtocols: "Опасные действия",
        languageUpdated: "Язык успешно изменен на Русский",
        active: "Активен"
      },
      nav: {
        dashboard: "Дашборд",
        earn: "Доход",
        mining: "Майнинг",
        liveTrading: "Торговля",
        wallet: "Кошелек",
        support: "Поддержка",
        settings: "Настройки",
        profile: "Профиль",
        logout: "Выйти",
        language: "Язык"
      },
      common: {
        save: "Сохранить",
        cancel: "Отмена",
        status: "Статус",
        connected: "Подключено",
        offline: "Оффлайн",
        active: "Активен"
      }
    }
  },
  ar: {
    translation: {
      settings: {
        title: "إعدادات الحساب",
        subtitle: "إدارة بيانات الاعتماد الشخصية ومفاتيح API وبروتوكولات الأمان وتفضيلات المنصة.",
        profileTab: "الملف الشخصي و KYC",
        securityTab: "الأمان والتحقق",
        notificationsTab: "الإشعارات",
        preferencesTab: "التفضيلات",
        languageSectionTitle: "اللغة والإعدادات الإقليمية",
        languageSectionSubtitle: "اختر لغة العرض المفضلة للوحات التحكم والإشعارات وتقارير التداول.",
        selectLanguageLabel: "لغة الواجهة",
        currentLanguage: "اللغة النشطة",
        themeSectionTitle: "مظهر المنصة والتجربة",
        toggleThemeLabel: "تبديل المظهر",
        fintechDark: "الوضع الداكن المالي",
        fintechDarkDesc: "تباين عالي وراحة للعين مع لوحة تحكم أزرق داكن احترافية.",
        cleanLight: "الوضع الفاتح النظيف",
        cleanLightDesc: "مظهر نهاري ساطع مع لمسات زرقاء حيوية وحدود بطاقات ناعمة.",
        dangerProtocols: "بروتوكولات الأمان العالية",
        languageUpdated: "تم تحديث اللغة بنجاح إلى العربية",
        active: "نشط"
      },
      nav: {
        dashboard: "لوحة التحكم",
        earn: "الأرباح",
        mining: "التعدين",
        liveTrading: "التداول المباشر",
        wallet: "المحفظة",
        support: "الدعم الفني",
        settings: "الإعدادات",
        profile: "الملف الشخصي",
        logout: "تسجيل الخروج",
        language: "اللغة"
      },
      common: {
        save: "حفظ التغييرات",
        cancel: "إلغاء",
        status: "الحالة",
        connected: "متصل",
        offline: "غير متصل",
        active: "نشط"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'es', 'fr', 'de', 'zh', 'ja', 'pt', 'ru', 'ar'],
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng'
    }
  });

i18n.on('languageChanged', (lng) => {
  const baseCode = lng.split('-')[0];
  const langMeta = SUPPORTED_LANGUAGES.find(l => l.code === baseCode) || SUPPORTED_LANGUAGES[0];
  const dir = langMeta.dir || 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = baseCode;
});

export default i18n;
