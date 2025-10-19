import { Shield, TrendingUp, Users } from 'lucide-react'

/**
 * Seção de branding (lado esquerdo 25% da Home)
 * Contém gradiente, círculos animados, logo e features list
 * Segue especificações do branding-section.md
 */
export function BrandingSection() {
  return (
    <div className="hidden md:flex md:w-1/4 lg:w-1/4 bg-gradient-to-br from-primary via-primary/95 to-brand-primary sticky top-0 relative">
      {/* Background Pattern - Círculos Animados */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 md:w-32 md:h-32 border-2 border-white rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-10 md:right-20 w-12 h-12 md:w-20 md:h-20 border-2 border-white rounded-full animate-pulse delay-300"></div>
        <div className="absolute bottom-20 left-10 md:left-20 w-10 h-10 md:w-16 md:h-16 border-2 border-white rounded-full animate-pulse delay-500"></div>
        <div className="absolute bottom-32 right-8 md:right-16 w-16 h-16 md:w-24 md:h-24 border-2 border-white rounded-full animate-pulse delay-700"></div>
      </div>

      {/* Content */}
      <div className="z-10 px-4 md:px-6 lg:px-8 text-white md:min-h-0 md:h-[calc(100svh-4rem)] md:supports-[height:100dvh]:h-[calc(100dvh-4rem)] flex">
        <div className="w-full grid min-h-full place-content-center">
          {/* Logo/Icon */}
          <div className="mb-6 md:mb-8 text-center">
            <img
              src="/logo-farmace.png"
              alt="SysOEE Logo"
              className="mb-4 mx-auto"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.className = 'w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm';
                fallback.innerHTML = '<span class="text-white font-bold text-lg md:text-xl">OEE</span>';
                target.parentElement?.insertBefore(fallback, target);
              }}
            />
          </div>

          {/* Description */}
          <div className="mb-8 md:mb-12">
            <p className="text-white/80 text-sm md:text-lg leading-relaxed mb-4 md:mb-6">
              Monitoramento de eficiência operacional pharma-native com compliance ALCOA+ e BPF embarcados
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4 md:space-y-6">
            {/* Feature 1: Compliance */}
            <div className="flex items-center space-x-3 md:space-x-4 group">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300">
                <Shield className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm md:text-base">Compliance Regulatório</h3>
                <p className="text-white/70 text-xs md:text-sm">ALCOA+ e CFR 21 Part 11</p>
              </div>
            </div>

            {/* Feature 2: Gestão em Tempo Real */}
            <div className="flex items-center space-x-3 md:space-x-4 group">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300">
                <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm md:text-base">Gestão em Tempo Real</h3>
                <p className="text-white/70 text-xs md:text-sm">Dashboards interativos e análise preditiva</p>
              </div>
            </div>

            {/* Feature 3: Colaboração */}
            <div className="flex items-center space-x-3 md:space-x-4 group">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300">
                <Users className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm md:text-base">Colaboração Integrada</h3>
                <p className="text-white/70 text-xs md:text-sm">37 linhas de produção conectadas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

