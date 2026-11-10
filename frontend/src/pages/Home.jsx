import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const arenasDemo = [
  {
    nome: 'Arena Maré Alta',
    cidade: 'Campinas, SP',
    modalidades: ['Beach Tennis', 'Futevôlei'],
    quadras: '4 quadras de areia',
    avaliacao: '4,9',
    imagem: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1000&q=85',
    destaque: 'Beach tennis em destaque'
  },
  {
    nome: 'Areia Club',
    cidade: 'Sorocaba, SP',
    modalidades: ['Beach Tennis', 'Vôlei de areia'],
    quadras: '3 quadras de areia',
    avaliacao: '4,8',
    imagem: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1000&q=85',
    destaque: 'Estrutura completa'
  },
  {
    nome: 'Arena Brisa',
    cidade: 'Santos, SP',
    modalidades: ['Futevôlei', 'Vôlei de areia'],
    quadras: '2 quadras de areia',
    avaliacao: '4,9',
    imagem: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1000&q=85',
    destaque: 'Clima de praia na cidade'
  }
];

function Brand({ compact = false }) {
  return (
    <Link className={`brand${compact ? ' brand--compact' : ''}`} to="/" aria-label="ArenaGo — início">
      <span className="brand-mark" aria-hidden="true"><span /></span>
      <span className="brand-name">arena<span>go</span></span>
    </Link>
  );
}

function ArrowIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function PinIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" stroke="currentColor" strokeWidth="1.7" /><circle cx="12" cy="10" r="2.3" stroke="currentColor" strokeWidth="1.7" /></svg>;
}

function SearchIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.8" /><path d="m16 16 4.3 4.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
}

function CourtCard({ arena, cta }) {
  return (
    <article className="court-card">
      <div className="court-card__image" style={{ backgroundImage: `linear-gradient(180deg, transparent 48%, rgba(12, 31, 23, .62)), url("${arena.imagem}")` }} role="img" aria-label={`Quadra de areia para ${arena.modalidades.join(' e ')}`}>
        <span className="court-card__badge">{arena.destaque}</span>
        <span className="court-card__rating"><span aria-hidden="true">★</span> {arena.avaliacao}</span>
      </div>
      <div className="court-card__body">
        <div className="court-card__topline"><span>{arena.quadras}</span><span className="court-card__dot" /></div>
        <h3>{arena.nome}</h3>
        <p className="court-card__location"><PinIcon /> {arena.cidade}</p>
        <div className="court-card__sports">{arena.modalidades.map(modalidade => <span key={modalidade}>{modalidade}</span>)}</div>
        <Link className="court-card__link" to={cta}>
          {cta === '/nova-reserva' ? 'Consultar horários' : 'Criar conta para reservar'} <ArrowIcon />
        </Link>
      </div>
    </article>
  );
}

export default function Home() {
  const { estaAutenticado } = useAuth();
  const autenticado = estaAutenticado();
  const [cidade, setCidade] = useState('');
  const [modalidade, setModalidade] = useState('Beach Tennis');
  const [filtro, setFiltro] = useState({ cidade: '', modalidade: 'Beach Tennis' });
  const [menuAberto, setMenuAberto] = useState(false);
  const reservaHref = autenticado ? '/nova-reserva' : '/cadastro';
  const arenas = useMemo(() => arenasDemo.filter(arena => {
    const combinaCidade = !filtro.cidade || arena.cidade.toLowerCase().includes(filtro.cidade.toLowerCase());
    const combinaModalidade = filtro.modalidade === 'Todas as modalidades' || arena.modalidades.includes(filtro.modalidade);
    return combinaCidade && combinaModalidade;
  }), [filtro]);

  const buscar = event => {
    event.preventDefault();
    setFiltro({ cidade: cidade.trim(), modalidade });
    setMenuAberto(false);
    document.getElementById('arenas')?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="home-page">
      <header className="site-header">
        <div className="site-header__inner">
          <Brand />
          <button className="nav-toggle" type="button" aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuAberto} onClick={() => setMenuAberto(!menuAberto)}>
            <span /><span /><span />
          </button>
          <nav className={`site-nav${menuAberto ? ' site-nav--open' : ''}`} aria-label="Navegação principal">
            <a href="#arenas" onClick={() => setMenuAberto(false)}>Explorar arenas</a>
            <a href="#como-funciona" onClick={() => setMenuAberto(false)}>Como funciona</a>
            <Link to="/login" className="site-nav__login" onClick={() => setMenuAberto(false)}>Entrar</Link>
            <Link to={autenticado ? '/dashboard' : '/cadastro'} className="button button--nav" onClick={() => setMenuAberto(false)}>{autenticado ? 'Meu painel' : 'Criar conta'} <ArrowIcon /></Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero__backdrop" />
          <div className="hero__content">
            <div className="hero__copy">
              <span className="eyebrow eyebrow--light"><span className="eyebrow__pulse" /> SEU JOGO, SEU PRÓXIMO NÍVEL</span>
              <h1 id="hero-title">A areia está chamando. <em>A quadra também.</em></h1>
              <p>Encontre espaços incríveis para jogar beach tennis, escolha seu horário e deixe o resto com a ArenaGo.</p>
              <div className="hero__actions">
                <a className="button button--lime" href="#arenas">Encontrar minha quadra <ArrowIcon /></a>
                <a className="hero__text-link" href="#como-funciona">Descubra como funciona <span aria-hidden="true">↓</span></a>
              </div>
              <div className="hero__proof" aria-label="Vantagens da ArenaGo">
                <span><b>01</b> Encontre</span><i />
                <span><b>02</b> Escolha</span><i />
                <span><b>03</b> Jogue</span>
              </div>
            </div>
            <div className="hero__visual" aria-hidden="true">
              <div className="hero__photo" />
              <div className="hero__photo-accent" />
              <div className="hero__floating-card">
                <span className="hero__floating-icon">✳</span>
                <div><strong>Partida marcada.</strong><small>Seu próximo jogo começa aqui.</small></div>
                <span className="hero__floating-arrow"><ArrowIcon /></span>
              </div>
              <div className="hero__tag"><span>BEACH</span><strong>TENNIS</strong><small>É hora de jogar.</small></div>
            </div>
          </div>
          <form className="search-panel" onSubmit={buscar} aria-label="Buscar arenas de demonstração">
            <label className="search-field search-field--city">
              <span className="search-field__icon"><PinIcon /></span>
              <span className="search-field__content"><span>Onde você quer jogar?</span><input value={cidade} onChange={event => setCidade(event.target.value)} placeholder="Cidade ou região" aria-label="Cidade ou região" /></span>
            </label>
            <label className="search-field search-field--sport">
              <span className="search-field__icon search-field__icon--sport">✳</span>
              <span className="search-field__content"><span>Qual é o seu jogo?</span><select value={modalidade} onChange={event => setModalidade(event.target.value)} aria-label="Modalidade esportiva"><option>Beach Tennis</option><option>Futevôlei</option><option>Vôlei de areia</option><option>Todas as modalidades</option></select></span>
            </label>
            <button type="submit" className="button button--search"><SearchIcon /><span>Buscar arenas</span></button>
          </form>
          <p className="hero__search-note">Vitrine demonstrativa — horários reais são consultados após entrar na sua conta.</p>
        </section>

        <section className="benefit-strip" aria-label="Benefícios ArenaGo">
          <div className="benefit-strip__item"><span className="benefit-strip__number">01</span><div><strong>Menos tempo procurando</strong><span>Encontre espaços para o seu esporte.</span></div></div>
          <div className="benefit-strip__item"><span className="benefit-strip__number">02</span><div><strong>Reserva sem complicação</strong><span>Organize seu próximo jogo em poucos passos.</span></div></div>
          <div className="benefit-strip__item"><span className="benefit-strip__number">03</span><div><strong>Mais tempo em quadra</strong><span>Você cuida do saque. A gente da agenda.</span></div></div>
        </section>

        <section className="section courts-section" id="arenas">
          <div className="section-heading">
            <div><span className="eyebrow">BORA JOGAR?</span><h2>Quadras que combinam <em>com você.</em></h2><p>Explore uma prévia da experiência ArenaGo e imagine sua próxima partida.</p></div>
            <Link className="text-link" to={autenticado ? '/nova-reserva' : '/cadastro'}>Ver como reservar <ArrowIcon /></Link>
          </div>
          <div className="demo-notice"><span aria-hidden="true">i</span><p><strong>Prévia demonstrativa:</strong> estes espaços são exemplos visuais; disponibilidade e cadastro de arenas dependem da configuração da plataforma.</p></div>
          {arenas.length > 0 ? <div className="courts-grid">{arenas.map(arena => <CourtCard key={arena.nome} arena={arena} cta={reservaHref} />)}</div> : <div className="empty-results"><span aria-hidden="true">⌕</span><h3>Nenhuma arena nesta prévia</h3><p>Tente outra cidade ou modalidade para explorar os exemplos.</p><button type="button" className="button button--outline" onClick={() => { setCidade(''); setModalidade('Todas as modalidades'); setFiltro({ cidade: '', modalidade: 'Todas as modalidades' }); }}>Limpar filtros</button></div>}
          <p className="demo-caption">A busca acima filtra somente os exemplos exibidos nesta página. Para consultar horários reais, entre na sua conta.</p>
        </section>

        <section className="how-section" id="como-funciona">
          <div className="how-section__inner">
            <div className="how-section__intro"><span className="eyebrow eyebrow--light">SIMPLES ASSIM</span><h2>Do “vamos jogar?”<br />ao <em>“partiu quadra”.</em></h2><p>Uma experiência feita para quem prefere gastar energia no jogo — não organizando a agenda.</p><Link className="button button--lime" to={autenticado ? '/nova-reserva' : '/cadastro'}>{autenticado ? 'Agendar uma quadra' : 'Começar agora'} <ArrowIcon /></Link></div>
            <div className="how-steps">
              <article className="how-step"><span>01</span><div><h3>Encontre o espaço</h3><p>Explore arenas e modalidades para achar o lugar que combina com a sua partida.</p></div><span className="how-step__symbol" aria-hidden="true"><SearchIcon /></span></article>
              <article className="how-step"><span>02</span><div><h3>Escolha seu horário</h3><p>Acesse sua conta para consultar os horários disponíveis e os detalhes da quadra.</p></div><span className="how-step__symbol" aria-hidden="true">◷</span></article>
              <article className="how-step"><span>03</span><div><h3>Confirme e jogue</h3><p>Finalize sua reserva e convide a galera para entrar em quadra.</p></div><span className="how-step__symbol" aria-hidden="true">↗</span></article>
            </div>
          </div>
        </section>

        <section className="final-cta">
          <div className="final-cta__orb" />
          <div><span className="eyebrow eyebrow--light">O PRÓXIMO JOGO COMEÇA AQUI</span><h2>Uma quadra. Sua galera.<br /><em>Uma história nova.</em></h2><p>Crie sua conta e organize sua próxima partida com a ArenaGo.</p></div>
          <Link className="button button--lime" to={autenticado ? '/nova-reserva' : '/cadastro'}>{autenticado ? 'Fazer uma reserva' : 'Criar minha conta'} <ArrowIcon /></Link>
        </section>
      </main>

      <footer className="site-footer">
        <div className="site-footer__main"><div className="site-footer__brand"><Brand compact /><p>Mais perto da quadra.<br />Mais perto do seu próximo jogo.</p></div><div className="site-footer__links"><div><strong>Explore</strong><a href="#arenas">Arenas</a><a href="#como-funciona">Como funciona</a></div><div><strong>Sua conta</strong><Link to="/login">Entrar</Link><Link to="/cadastro">Criar conta</Link></div></div></div>
        <div className="site-footer__bottom"><span>© {new Date().getFullYear()} ArenaGo. Feito para quem ama jogar.</span><span>BEACH TENNIS · FUTEVÔLEI · VÔLEI DE AREIA</span></div>
      </footer>
    </div>
  );
}
