# Design System - Novidades do Chrome

> Documentação completa do design system extraído da página oficial "Novidades do Chrome" do Google.

---

## 📋 Índice

1. [Paleta de Cores](#paleta-de-cores)
2. [Tipografia](#tipografia)
3. [Estrutura de Layout](#estrutura-de-layout)
4. [Componentes](#componentes)
5. [Responsividade](#responsividade)
6. [Elementos Decorativos](#elementos-decorativos)
7. [Animações](#animações)
8. [Boas Práticas](#boas-práticas)

---

## 🎨 Paleta de Cores

### Cores Principais
```css
:root {
  /* Backgrounds */
  --background-primary: #28292A;
  --background-hero: linear-gradient(135deg, #004976 0%, #001E3C 100%);
  --background-card: rgba(60, 64, 67, 0.5);
  --background-card-hover: rgba(60, 64, 67, 0.7);
  
  /* Textos */
  --text-primary: #ECF3FE;
  --text-secondary: #BDC1C6;
  --text-dark: #000000;
  --text-white: #FFFFFF;
  
  /* Acentos */
  --accent-blue: #1A73E8;
  --accent-light-blue: #A8C7FA;
  --accent-dark-blue: #062E6F;
  --badge-blue: #0B57D0;
  
  /* Gradientes */
  --gradient-hero: linear-gradient(135deg, #004976 0%, #001E3C 100%);
  --gradient-mockup: linear-gradient(135deg, #A8C7FA 0%, #C8E0FF 100%);
  --gradient-qr: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%);
}
```

### Guia de Uso de Cores

| Cor | Uso | Exemplo |
|-----|-----|---------|
| `#28292A` | Fundo principal da página | Background do body |
| `#004976 → #001E3C` | Hero section (gradiente) | Seção de destaque superior |
| `#ECF3FE` | Títulos principais | H1, H2 |
| `#BDC1C6` | Texto de corpo | Parágrafos, listas |
| `#A8C7FA` | Botões primários | CTAs, links importantes |
| `#0B57D0` | Badges/Tags | Categorias (PRODUTIVIDADE, etc) |

---

## 📝 Tipografia

### Família de Fontes
```css
:root {
  --font-primary: "Google Sans", Arial, sans-serif;
}

/* Importação (caso não tenha Google Sans instalado) */
@import url('https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&display=swap');
```

### Hierarquia Tipográfica
```css
/* H1 - Hero Title */
h1, .h1 {
  font-size: 56px;
  font-weight: 500;
  line-height: 1.2;
  color: var(--text-primary);
  letter-spacing: -0.5px;
}

/* H2 - Section Title */
h2, .h2 {
  font-size: 44px;
  font-weight: 500;
  line-height: 1.3;
  color: var(--text-primary);
  margin-bottom: 24px;
}

/* H3 - Subsection Title */
h3, .h3 {
  font-size: 24px;
  font-weight: 400;
  line-height: 1.4;
  color: var(--text-primary);
  margin-bottom: 16px;
}

/* Body Text */
body, p {
  font-size: 16px;
  font-weight: 400;
  line-height: 1.6;
  color: var(--text-secondary);
}

/* Badge Text */
.badge {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

/* Button Text */
.btn {
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.25px;
}
```

### Escala Tipográfica Responsiva
```css
/* Desktop (padrão acima) */

/* Tablet */
@media (max-width: 1024px) {
  h1, .h1 { font-size: 44px; }
  h2, .h2 { font-size: 36px; }
  h3, .h3 { font-size: 20px; }
}

/* Mobile */
@media (max-width: 640px) {
  h1, .h1 { font-size: 32px; }
  h2, .h2 { font-size: 28px; }
  h3, .h3 { font-size: 18px; }
  body, p { font-size: 14px; }
}
```

---

## 🏗️ Estrutura de Layout

### Sistema de Grid
```css
/* Container Principal */
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  width: 100%;
}

/* Container Estreito (para conteúdo de leitura) */
.container-narrow {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Seções */
.section {
  padding: 80px 0;
}

.section-hero {
  padding: 120px 24px 80px;
}
```

### Layouts de Grid
```css
/* Grid 2 Colunas - Texto + Imagem */
.two-column-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
}

/* Grid 3 Colunas - Cards de Recursos */
.card-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-top: 60px;
}

/* Grid 2 Colunas - Cards Menores */
.card-grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
}
```

### Espaçamento
```css
:root {
  /* Espaçamentos Verticais */
  --spacing-xs: 8px;
  --spacing-sm: 16px;
  --spacing-md: 24px;
  --spacing-lg: 40px;
  --spacing-xl: 60px;
  --spacing-2xl: 80px;
  --spacing-3xl: 120px;
  
  /* Espaçamentos entre seções */
  --section-spacing: 80px;
  --section-spacing-lg: 120px;
}
```

---

## 🎯 Componentes

### 1. Hero Section
```html
<section class="hero">
  <div class="hero-decorations">
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>
    <div class="blob blob-3"></div>
  </div>
  
  <div class="hero-content">
    <h1 class="hero-title">Novidades do Chrome</h1>
    <img src="chrome-logo.png" alt="Chrome Logo" class="hero-logo">
  </div>
  
  <div class="qr-box">
    <img src="qr-code.png" alt="QR Code">
    <p>Instale o Chrome no seu smartphone</p>
  </div>
</section>
```
```css
.hero {
  background: var(--gradient-hero);
  position: relative;
  overflow: hidden;
  padding: 120px 24px 80px;
  text-align: center;
  min-height: 400px;
}

.hero-decorations {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.blob {
  position: absolute;
  border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
  background: radial-gradient(
    circle, 
    rgba(25, 118, 210, 0.4) 0%, 
    rgba(13, 71, 161, 0.2) 100%
  );
  filter: blur(40px);
  animation: float 20s infinite ease-in-out;
}

.blob-1 {
  width: 400px;
  height: 400px;
  top: -200px;
  left: -100px;
}

.blob-2 {
  width: 500px;
  height: 500px;
  top: -150px;
  right: -150px;
  animation-delay: -5s;
}

.blob-3 {
  width: 350px;
  height: 350px;
  bottom: -100px;
  left: 50%;
  transform: translateX(-50%);
  animation-delay: -10s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(30px, -30px) rotate(120deg); }
  66% { transform: translate(-20px, 20px) rotate(240deg); }
}

.hero-content {
  position: relative;
  z-index: 2;
}

.hero-title {
  font-size: 56px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 40px;
}

.hero-logo {
  width: 80px;
  height: 80px;
  margin: 0 auto;
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3));
}
```

### 2. Badge/Tag
```html
<span class="badge">PRODUTIVIDADE</span>
<span class="badge badge-ai">INTELIGÊNCIA ARTIFICIAL</span>
<span class="badge badge-mobile">CELULAR</span>
```
```css
.badge {
  display: inline-block;
  background: var(--badge-blue);
  color: var(--text-white);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  padding: 8px 16px;
  border-radius: 4px;
  margin-bottom: 16px;
}

/* Variações de badges */
.badge-ai {
  background: #8E24AA;
}

.badge-mobile {
  background: #00897B;
}

.badge-security {
  background: #D32F2F;
}

.badge-performance {
  background: #F57C00;
}

.badge-personalize {
  background: #7B1FA2;
}
```

### 3. Feature Section (Texto + Imagem)
```html
<section class="feature-section">
  <div class="feature-content">
    <span class="badge">PRODUTIVIDADE</span>
    <h2>Deixe que o Chrome leia páginas em voz alta</h2>
    <p>O Chrome agora pode ler páginas da Web em voz alta. As palavras na página são destacadas para ajudar você a acompanhar a leitura.</p>
    
    <ol class="feature-list">
      <li>Para usar a leitura em voz alta, clique com o botão direito do mouse em uma página e selecione <strong>Abrir no modo de leitura</strong>.</li>
      <li>Clique no botão <strong>Tocar</strong>.</li>
      <li>Você pode ajustar a <strong>voz</strong>, a <strong>velocidade</strong> e o <strong>tipo de destaque</strong>.</li>
    </ol>
  </div>
  
  <div class="feature-mockup">
    <img src="feature-image.png" alt="Feature Screenshot">
  </div>
</section>
```
```css
.feature-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
  padding: 80px 0;
}

.feature-section:nth-child(even) {
  direction: rtl;
}

.feature-section:nth-child(even) > * {
  direction: ltr;
}

.feature-content h2 {
  font-size: 44px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 24px;
  line-height: 1.3;
}

.feature-content p {
  font-size: 16px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 24px;
}

.feature-list {
  color: var(--text-secondary);
  padding-left: 24px;
  margin: 0;
}

.feature-list li {
  margin-bottom: 16px;
  line-height: 1.6;
}

.feature-list strong {
  color: var(--text-white);
  font-weight: 500;
}

.feature-mockup {
  background: var(--gradient-mockup);
  border-radius: 32px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.feature-mockup img {
  width: 100%;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}
```

### 4. Button/CTA
```html
<button class="btn btn-primary">Faça um teste agora</button>
<button class="btn btn-secondary">Ver mais</button>
<button class="btn btn-icon">
  <svg>...</svg>
</button>
```
```css
.btn {
  font-family: var(--font-primary);
  font-size: 14px;
  font-weight: 500;
  padding: 12px 32px;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.btn-primary {
  background: var(--accent-light-blue);
  color: var(--accent-dark-blue);
}

.btn-primary:hover {
  background: #90B4E8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(168, 199, 250, 0.4);
}

.btn-secondary {
  background: transparent;
  color: var(--accent-light-blue);
  border: 2px solid var(--accent-light-blue);
}

.btn-secondary:hover {
  background: rgba(168, 199, 250, 0.1);
  transform: translateY(-2px);
}

.btn-icon {
  width: 48px;
  height: 48px;
  padding: 0;
  border-radius: 50%;
  background: var(--accent-light-blue);
  justify-content: center;
}

.btn:active {
  transform: translateY(0);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### 5. Resource Cards
```html
<div class="card-grid">
  <article class="resource-card">
    <div class="resource-card-image">
      <img src="card-image.png" alt="Feature">
    </div>
    <h3 class="resource-card-title">Acesse o que precisar em PDFs digitalizados</h3>
    <p class="resource-card-description">Com o Chrome, agora você pode pesquisar, selecionar ou copiar o texto...</p>
    <div class="resource-card-icon">
      <svg>+</svg>
    </div>
  </article>
</div>
```
```css
.resource-card {
  background: var(--background-card);
  border-radius: 24px;
  padding: 24px;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.resource-card:hover {
  background: var(--background-card-hover);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.resource-card-image {
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 16px;
  background: #1E1E1E;
}

.resource-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.resource-card-title {
  font-size: 18px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.resource-card-description {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.resource-card-icon {
  width: 48px;
  height: 48px;
  background: var(--accent-light-blue);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  color: var(--accent-dark-blue);
  font-size: 24px;
  font-weight: 300;
  transition: transform 0.3s ease;
}

.resource-card:hover .resource-card-icon {
  transform: rotate(90deg);
}
```

### 6. QR Code Box
```html
<div class="qr-box">
  <img src="qr-code.png" alt="QR Code" class="qr-image">
  <p class="qr-text">Instale o Chrome no seu smartphone</p>
</div>
```
```css
.qr-box {
  background: var(--gradient-qr);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  position: absolute;
  top: 40px;
  right: 40px;
  z-index: 10;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.qr-image {
  width: 120px;
  height: 120px;
  margin-bottom: 12px;
  border-radius: 8px;
}

.qr-text {
  font-size: 12px;
  color: var(--accent-dark-blue);
  font-weight: 500;
  max-width: 120px;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .qr-box {
    position: static;
    margin: 24px auto 0;
    max-width: 200px;
  }
}
```

### 7. Browser Mockup
```html
<div class="browser-mockup">
  <div class="browser-header">
    <div class="browser-dots">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <div class="browser-address-bar">
      <span class="browser-url">chrome://settings</span>
    </div>
  </div>
  <div class="browser-content">
    <img src="screenshot.png" alt="Browser Content">
  </div>
</div>
```
```css
.browser-mockup {
  background: #FFFFFF;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.browser-header {
  background: #E8EAED;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.browser-dots {
  display: flex;
  gap: 6px;
}

.browser-dots span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #D1D3D6;
}

.browser-dots span:nth-child(1) { background: #FF5F56; }
.browser-dots span:nth-child(2) { background: #FFBD2E; }
.browser-dots span:nth-child(3) { background: #27C93F; }

.browser-address-bar {
  flex: 1;
  background: #FFFFFF;
  padding: 6px 12px;
  border-radius: 16px;
}

.browser-url {
  font-size: 12px;
  color: #5F6368;
}

.browser-content {
  background: #FFFFFF;
}

.browser-content img {
  width: 100%;
  display: block;
}
```

---

## 📱 Responsividade

### Breakpoints
```css
:root {
  --breakpoint-mobile: 640px;
  --breakpoint-tablet: 1024px;
  --breakpoint-desktop: 1400px;
}
```

### Media Queries
```css
/* Mobile First Approach */

/* Base styles (Mobile) */
.container {
  padding: 0 16px;
}

/* Tablet */
@media (min-width: 640px) {
  .container {
    padding: 0 24px;
  }
  
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .two-column-layout,
  .feature-section {
    grid-template-columns: 1fr 1fr;
  }
  
  .card-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Large Desktop */
@media (min-width: 1400px) {
  .container {
    max-width: 1400px;
  }
}

/* Adaptações Mobile */
@media (max-width: 640px) {
  .hero {
    padding: 60px 16px 40px;
  }
  
  .feature-section {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  
  .feature-mockup {
    padding: 24px;
  }
  
  .section {
    padding: 40px 0;
  }
  
  .qr-box {
    position: static;
    margin: 24px auto 0;
  }
}
```

---

## 🎭 Elementos Decorativos

### Formas Orgânicas (Blobs)
```css
.decorative-blob {
  position: absolute;
  border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
  background: radial-gradient(
    circle at 30% 50%,
    rgba(25, 118, 210, 0.4) 0%,
    rgba(13, 71, 161, 0.2) 50%,
    transparent 100%
  );
  filter: blur(40px);
  animation: morph 20s infinite ease-in-out;
}

@keyframes morph {
  0%, 100% {
    border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
  }
  50% {
    border-radius: 60% 40% 30% 70% / 50% 60% 40% 50%;
  }
}
```

### Gradientes de Overlay
```css
.gradient-overlay {
  position: relative;
}

.gradient-overlay::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.6) 100%
  );
  pointer-events: none;
}
```

---

## ✨ Animações e Transições

### Transições Base
```css
* {
  transition-property: background, color, transform, opacity, box-shadow;
  transition-duration: 0.3s;
  transition-timing-function: ease;
}
```

### Animações de Hover
```css
/* Hover em Cards */
.card-hover-effect {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-hover-effect:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
}

/* Hover em Botões */
.btn-hover-effect:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.btn-hover-effect:active {
  transform: translateY(0);
}
```

### Animações de Entrada (Scroll)
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-on-scroll {
  animation: fadeInUp 0.6s ease-out;
}

/* Stagger Animation */
.stagger-animation > * {
  opacity: 0;
  animation: fadeInUp 0.6s ease-out forwards;
}

.stagger-animation > *:nth-child(1) { animation-delay: 0.1s; }
.stagger-animation > *:nth-child(2) { animation-delay: 0.2s; }
.stagger-animation > *:nth-child(3) { animation-delay: 0.3s; }
.stagger-animation > *:nth-child(4) { animation-delay: 0.4s; }
```

### Animação de Loading
```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.loading-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

---

## 🎬 Vídeos e Mídia

### Container de Vídeo/GIF
```css
.media-container {
  position: relative;
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  background: #000;
}

.media-container video,
.media-container img {
  width: 100%;
  height: auto;
  display: block;
}

.media-controls {
  position: absolute;
  bottom: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.media-controls:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: scale(1.1);
}
```

---

## 📐 Footer
```html
<footer class="footer">
  <div class="container">
    <div class="footer-social">
      <h3>Siga-nos</h3>
      <div class="social-links">
        <a href="#" aria-label="YouTube">
          <svg>...</svg>
        </a>
        <a href="#" aria-label="Twitter">
          <svg>...</svg>
        </a>
        <a href="#" aria-label="Facebook">
          <svg>...</svg>
        </a>
        <a href="#" aria-label="LinkedIn">
          <svg>...</svg>
        </a>
        <a href="#" aria-label="TikTok">
          <svg>...</svg>
        </a>
      </div>
    </div>
    
    <div class="footer-content">
      <div class="footer-brand">
        <img src="google-logo.svg" alt="Google">
      </div>
      
      <nav class="footer-nav">
        <a href="#">Privacidade e termos</a>
        <a href="#">Sobre o Google</a>
        <a href="#">Produtos do Google</a>
      </nav>
      
      <div class="footer-utils">
        <a href="#" class="help-link">Ajuda</a>
        <select class="language-selector">
          <option>Português - Brasil</option>
          <option>English - United States</option>
        </select>
      </div>
    </div>
  </div>
</footer>
```
```css
.footer {
  background: var(--background-primary);
  padding: 60px 0 40px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 80px;
}

.footer-social {
  margin-bottom: 40px;
}

.footer-social h3 {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 16px;
  font-weight: 400;
}

.social-links {
  display: flex;
  gap: 24px;
}

.social-links a {
  color: var(--text-secondary);
  transition: color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.social-links a:hover {
  color: var(--accent-light-blue);
}

.social-links svg {
  width: 24px;
  height: 24px;
}

.footer-content {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.footer-brand img {
  height: 24px;
  filter: brightness(0) invert(1);
}

.footer-nav {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}

.footer-nav a {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
}

.footer-nav a:hover {
  color: var(--text-primary);
}

.footer-utils {
  display: flex;
  gap: 24px;
  align-items: center;
}

.help-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
}

.language-selector {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .footer-nav {
    flex-direction: column;
    gap: 16px;
  }
  
  .footer-utils {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  }
  
  .language-selector {
    width: 100%;
  }
}
```

---

## ♿ Acessibilidade

### Boas Práticas
```css
/* Focus States */
:focus-visible {
  outline: 2px solid var(--accent-light-blue);
  outline-offset: 2px;
  border-radius: 4px;
}

button:focus-visible,
a:focus-visible {
  outline: 2px solid var(--accent-light-blue);
  outline-offset: 4px;
}

/* Skip to Content */
.skip-to-content {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--accent-light-blue);
  color: var(--accent-dark-blue);
  padding: 8px 16px;
  text-decoration: none;
  border-radius: 0 0 4px 0;
  z-index: 100;
}

.skip-to-content:focus {
  top: 0;
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Screen Reader Only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

## 🌓 Dark Mode (Opcional)
```css
/* O design já é dark por padrão, mas aqui está a variação light */

@media (prefers-color-scheme: light) {
  :root {
    --background-primary: #FFFFFF;
    --background-card: #F8F9FA;
    --background-card-hover: #E8EAED;
    --text-primary: #202124;
    --text-secondary: #5F6368;
  }
  
  .hero {
    background: linear-gradient(135deg, #1A73E8 0%, #0D47A1 100%);
  }
  
  .footer {
    background: #F8F9FA;
    border-top: 1px solid #DADCE0;
  }
}
```

---

## 📦 Utilities Classes
```css
/* Spacing Utilities */
.mt-0 { margin-top: 0; }
.mt-1 { margin-top: 8px; }
.mt-2 { margin-top: 16px; }
.mt-3 { margin-top: 24px; }
.mt-4 { margin-top: 40px; }
.mt-5 { margin-top: 60px; }
.mt-6 { margin-top: 80px; }

.mb-0 { margin-bottom: 0; }
.mb-1 { margin-bottom: 8px; }
.mb-2 { margin-bottom: 16px; }
.mb-3 { margin-bottom: 24px; }
.mb-4 { margin-bottom: 40px; }
.mb-5 { margin-bottom: 60px; }
.mb-6 { margin-bottom: 80px; }

/* Text Utilities */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.text-primary { color: var(--text-primary); }
.text-secondary { color: var(--text-secondary); }
.text-white { color: var(--text-white); }

.font-bold { font-weight: 700; }
.font-medium { font-weight: 500; }
.font-normal { font-weight: 400; }

/* Display Utilities */
.hidden { display: none; }
.block { display: block; }
.flex { display: flex; }
.grid { display: grid; }

/* Flex Utilities */
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.flex-col {
  flex-direction: column;
}

/* Gap Utilities */
.gap-1 { gap: 8px; }
.gap-2 { gap: 16px; }
.gap-3 { gap: 24px; }
.gap-4 { gap: 40px; }

/* Border Radius */
.rounded-sm { border-radius: 8px; }
.rounded { border-radius: 12px; }
.rounded-lg { border-radius: 16px; }
.rounded-xl { border-radius: 24px; }
.rounded-full { border-radius: 9999px; }

/* Shadow */
.shadow-sm { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); }
.shadow { box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2); }
.shadow-lg { box-shadow: 0 10px 40px rgba(0, 0, 0,