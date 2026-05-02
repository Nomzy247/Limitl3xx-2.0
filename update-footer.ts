import fs from 'fs';
let content = fs.readFileSync('src/components/Footer.tsx', 'utf-8');

const linkRegex = /<motion\.a\s+whileHover={{([^}]+)}}\s+transition={([^}]+)}\s+href="([^"]+)"\s+className="([^"]+)"\s*>([\s\S]*?)<\/motion\.a>/g;

content = content.replace(linkRegex, (match, hover, transition, href, className, children) => {
  if (href.startsWith('#')) return match;
  return `<Link to="${href}" className="${className} hover:text-[#00f0ff] transition-all hover:translate-x-1 block">${children}</Link>`;
});

// For social links that use motion.a but are external or anchor
const socialRegex = /<motion\.a\s+whileHover={{([^}]+)}}\s+whileTap={{([^}]+)}}\s+transition={([^}]+)}\s+href="([^"]+)"\s+className="([^"]+)"\s*>([\s\S]*?)<\/motion\.a>/g;
content = content.replace(socialRegex, (match, hover, tap, transition, href, className, children) => {
  return `<a href="${href}" className="${className} hover:text-[#00f0ff] hover:scale-110 active:scale-95 inline-block transition-all">${children}</a>`;
});

fs.writeFileSync('src/components/Footer.tsx', content);
