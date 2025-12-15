import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ModuleCard from '@/components/ui/ModuleCard';

export default function HomePage() {
  const modules = [
    {
      icon: '📋',
      title: 'CNDs',
      description: 'Gerenciamento completo de Certidões Negativas de Débitos com controle de vencimento e alertas automáticos',
      href: '/cnds',
    },
    {
      icon: '🔗',
      title: 'Links CND',
      description: 'Acesso rápido e organizado aos principais portais de emissão de CNDs federais, estaduais e municipais',
      href: '/links-cnd',
    },
    {
      icon: '⚙️',
      title: 'Rotina',
      description: 'Automação inteligente de processos e rotinas repetitivas para otimizar seu tempo e aumentar a eficiência',
      href: '/rotina',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="mb-12">
            <h1 className="text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-900 via-purple-600 to-purple-900 mb-6">
              C<span className="text-purple-500">0</span>ntrol
            </h1>
            <p className="text-3xl text-purple-800 font-light max-w-3xl mx-auto mb-4">
              Sistema de Gestão e Controle
            </p>
            <p className="text-lg text-purple-600 max-w-2xl mx-auto">
              Gerencie suas certidões, acesse portais e automatize rotinas em um só lugar
            </p>
          </div>
        </div>
      </section>

      {/* Cards Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {modules.map((module) => (
              <ModuleCard
                key={module.title}
                icon={module.icon}
                title={module.title}
                description={module.description}
                href={module.href}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card hover={false} className="bg-gradient-to-r from-purple-900 to-purple-700 border-0">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white mb-6">
                Pronto para começar?
              </h2>
              <p className="text-xl text-purple-100 mb-8">
                Selecione um módulo no menu lateral e otimize sua gestão de certidões e rotinas
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button variant="secondary" size="md">
                  Ver Tutorial
                </Button>
                <Button variant="primary" size="md">
                  Começar Agora
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}