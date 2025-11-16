# HTML e CSS Puro - Referência

## 📝 Versão HTML/CSS Puro (Sem React)

Para entender melhor a estrutura, aqui está uma versão simplificada usando apenas HTML e CSS.

### HTML Completo

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>APFARMA - Header</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <!-- Header Principal -->
  <header class="app-header">
    <!-- Seção Esquerda: Título -->
    <div class="header-left">
      <h1 class="header-title">APFARMA - Plataforma Integrada de Gestão</h1>
    </div>
    
    <!-- Seção Direita: Menu do Usuário -->
    <div class="header-right">
      <div class="user-menu">
        <!-- Botão Trigger -->
        <button 
          class="user-button" 
          id="userMenuButton"
          aria-haspopup="true"
          aria-expanded="false"
        >
          <!-- Avatar -->
          <div class="avatar">
            <div class="avatar-fallback">
              <svg class="user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </div>
          
          <!-- Informações do Usuário (Desktop) -->
          <div class="user-info">
            <p class="user-name">Emanuel Silva</p>
            <p class="user-role">Administrador</p>
          </div>
          
          <!-- Ícone Dropdown -->
          <svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="m6 9 6 6 6-6"></path>
          </svg>
        </button>
        
        <!-- Menu Dropdown -->
        <div class="dropdown-menu" id="userDropdown" hidden>
          <div class="dropdown-label">Minha Conta</div>
          <div class="dropdown-separator"></div>
          
          <a href="/perfil" class="dropdown-item">
            <svg class="item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Perfil</span>
          </a>
          
          <div class="dropdown-separator"></div>
          
          <button class="dropdown-item" onclick="handleLogout()">
            Sair
          </button>
        </div>
      </div>
    </div>
  </header>
  
  <script src="script.js"></script>
</body>
</html>
```

### CSS Completo

```css
/* Reset e Base */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  background-color: #f1f4f8;
  color: #141b1b;
}

/* Header Principal */
.app-header {
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 40;
}

/* Seção Esquerda */
.header-left {
  display: flex;
  align-items: center;
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  color: #242f65;
}

/* Seção Direita */
.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Menu do Usuário */
.user-menu {
  position: relative;
}

.user-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.user-button:hover {
  background-color: #f3f4f6;
}

.user-button:focus-visible {
  outline: 2px solid #242f65;
  outline-offset: 2px;
}

/* Avatar */
.avatar {
  position: relative;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
}

.avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #242f65;
  color: #ffffff;
}

.user-icon {
  width: 16px;
  height: 16px;
  stroke-width: 2;
}

/* Informações do Usuário */
.user-info {
  display: none;
  text-align: left;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #141b1b;
}

.user-role {
  font-size: 12px;
  color: #6b7280;
}

/* Ícone Chevron */
.chevron-icon {
  width: 16px;
  height: 16px;
  stroke-width: 2;
}

/* Dropdown Menu */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  min-width: 224px;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 4px;
  z-index: 50;
}

.dropdown-menu[hidden] {
  display: none;
}

.dropdown-label {
  padding: 6px 8px;
  font-size: 14px;
  font-weight: 600;
  color: #141b1b;
}

.dropdown-separator {
  height: 1px;
  background-color: #e5e7eb;
  margin: 4px -4px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 6px 8px;
  font-size: 14px;
  color: #141b1b;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #f3f4f6;
}

.dropdown-item:focus-visible {
  outline: 2px solid #242f65;
  outline-offset: -2px;
}

.item-icon {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  stroke-width: 2;
}

/* Responsividade */
@media (min-width: 768px) {
  .user-info {
    display: block;
  }
}

/* Mobile */
@media (max-width: 767px) {
  .header-title {
    font-size: 16px;
  }
  
  .app-header {
    padding: 0 16px;
  }
}
```

### JavaScript

```javascript
// script.js

// Elementos
const userMenuButton = document.getElementById('userMenuButton');
const userDropdown = document.getElementById('userDropdown');

// Toggle do dropdown
userMenuButton.addEventListener('click', () => {
  const isExpanded = userMenuButton.getAttribute('aria-expanded') === 'true';
  
  if (isExpanded) {
    closeDropdown();
  } else {
    openDropdown();
  }
});

// Abrir dropdown
function openDropdown() {
  userDropdown.hidden = false;
  userMenuButton.setAttribute('aria-expanded', 'true');
}

// Fechar dropdown
function closeDropdown() {
  userDropdown.hidden = true;
  userMenuButton.setAttribute('aria-expanded', 'false');
}

// Fechar ao clicar fora
document.addEventListener('click', (event) => {
  const isClickInside = userMenuButton.contains(event.target) || 
                        userDropdown.contains(event.target);
  
  if (!isClickInside) {
    closeDropdown();
  }
});

// Fechar com ESC
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeDropdown();
  }
});

// Navegação por teclado no menu
userDropdown.addEventListener('keydown', (event) => {
  const items = Array.from(userDropdown.querySelectorAll('.dropdown-item'));
  const currentIndex = items.indexOf(document.activeElement);
  
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    const nextIndex = (currentIndex + 1) % items.length;
    items[nextIndex].focus();
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    const prevIndex = (currentIndex - 1 + items.length) % items.length;
    items[prevIndex].focus();
  }
});

// Função de logout
function handleLogout() {
  // Implementar lógica de logout
  console.log('Logout');
  window.location.href = '/login';
}
```

## 🎨 Classes CSS Equivalentes ao Tailwind

| Tailwind | CSS Puro |
|----------|----------|
| `bg-white` | `background-color: #ffffff;` |
| `border-b` | `border-bottom: 1px solid #e5e7eb;` |
| `h-16` | `height: 64px;` |
| `flex` | `display: flex;` |
| `items-center` | `align-items: center;` |
| `justify-between` | `justify-content: space-between;` |
| `px-6` | `padding-left: 24px; padding-right: 24px;` |
| `sticky` | `position: sticky;` |
| `top-0` | `top: 0;` |
| `z-40` | `z-index: 40;` |
| `gap-4` | `gap: 16px;` |
| `rounded-full` | `border-radius: 50%;` |
| `text-xl` | `font-size: 20px;` |
| `font-semibold` | `font-weight: 600;` |
| `hidden md:block` | `display: none;` + `@media (min-width: 768px) { display: block; }` |

## 📱 Exemplo de Uso

Salve os três arquivos (HTML, CSS, JS) e abra o HTML no navegador para ver o header funcionando.

**Funcionalidades incluídas:**
- ✅ Dropdown funcional
- ✅ Fechar ao clicar fora
- ✅ Fechar com ESC
- ✅ Navegação por teclado (setas)
- ✅ Responsivo
- ✅ Acessível (ARIA)
- ✅ Hover states
- ✅ Focus visible

Esta versão serve como referência para entender a estrutura básica sem a complexidade do React.

