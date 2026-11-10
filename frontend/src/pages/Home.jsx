import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { publicAPI } from '../services/api';
import { currency, errorMessage } from '../components/Workspace';
import Brand from '../components/Brand';
import beachCourt from '../assets/beach-court.svg';

const sports = [
  { value: 'BEACH_TENNIS', label: 'Beach tennis', icon: '◉' },
  { value: 'FUTEVOLEI', label: 'Futevôlei', icon: '◎' },
  { value: 'VOLEI', label: 'Vôlei de areia', icon: '◌' },
  { value: '', label: 'Todas as modalidades', icon: '✳' }
];
const sportName = value => sports.find(sport => sport.value === value)?.label || value?.replaceAll('_', ' ') || 'Esportes de areia';

function ArrowIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function PinIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" stroke="currentColor" strokeWidth="1.7" /><circle cx="12" cy="10" r="2.3" stroke="currentColor" strokeWidth="1.7" /></svg>; }
function SearchIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.8" /><path d="m16 16 4.3 4.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>; }

function CourtCard({ venue, court, bookingState, authenticated, image }) {
  const target = authenticated ? '/nova-reserva' : '/cadastro';
  return <article className="court-card">
    <div className="court-card__image" role="img" aria-label={`Quadra de areia ${court.nome}`}>
      <img src={image} alt={`Vista da ${court.nome} na ${venue.nome}`} onError={event => { event.currentTarget.src = beachCourt; }} />
      <span className="court-card__badge">{sportName(court.tipo)}</span>
      <span className="court-card__available"><i /> {bookingState.horarioInicio ? 'Horário disponível' : 'Consulte horários'}</span>
    </div>
    <div className="court-card__body">
      <div className="court-card__topline"><span>{venue.nome}</span><span className="court-card__dot" /></div>
      <h3>{court.nome}</h3>
      <p className="court-card__location"><PinIcon /> {venue.endereco || 'Endereço não informado'}</p>
      <div className="court-card__meta"><span>Aberta {court.horarioInicio}–{court.horarioFim}</span><span>{court.durationPadraoMinutos} min</span></div>
      <div className="court-card__booking"><div><small>Valor por hora</small><strong>{currency(court.precoHora)}</strong></div>
        <Link className="button button--sand" to={target} state={{ prefillBooking: bookingState }}>Escolher horário <ArrowIcon /></Link>
      </div>
    </div>
  </article>;
}

export default function Home() {
  const { estaAutenticado } = useAuth();
  const authenticated = estaAutenticado();
  const [query, setQuery] = useState({ q: '', cidade: '', tipo: 'BEACH_TENNIS', data: '', hora: '', precoMax: '' });
  const [filters, setFilters] = useState({ ...query });
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [menuAberto, setMenuAberto] = useState(false);
  const totalCourts = useMemo(() => venues.reduce((sum, venue) => sum + venue.quadras.length, 0), [venues]);

  const buscar = async event => {
    event?.preventDefault();
    const next = { ...query, q: query.q.trim(), cidade: query.cidade.trim() };
    if (next.hora && !next.data) { setError('Escolha uma data para filtrar por horário.'); return; }
    setFilters(next); setLoading(true); setSearched(true); setError('');
    try {
      const { data } = await publicAPI.buscarQuadras(Object.fromEntries(Object.entries(next).filter(([, value]) => value !== '')));
      setVenues(data);
      document.getElementById('busca')?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
    } catch (requestError) {
      setVenues([]); setError(errorMessage(requestError));
    } finally { setLoading(false); }
  };

  const resetFilters = () => {
    const empty = { q: '', cidade: '', tipo: 'BEACH_TENNIS', data: '', hora: '', precoMax: '' };
    setQuery(empty); setFilters(empty); setVenues([]); setSearched(false); setError('');
  };

  return <div className="home-page" style={{ '--court-image': `url("${beachCourt}")` }}>
    <header className="site-header"><div className="site-header__inner">
      <Brand />
      <button className="nav-toggle" type="button" aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuAberto} onClick={() => setMenuAberto(!menuAberto)}><span /><span /><span /></button>
      <nav className={`site-nav${menuAberto ? ' site-nav--open' : ''}`} aria-label="Navegação principal">
        <a href="#busca" onClick={() => setMenuAberto(false)}>Buscar quadras</a><a href="#como-funciona" onClick={() => setMenuAberto(false)}>Como funciona</a>
        <Link to="/login" className="site-nav__login" onClick={() => setMenuAberto(false)}>Entrar</Link>
        <Link to={authenticated ? '/dashboard' : '/cadastro'} className="button button--nav" onClick={() => setMenuAberto(false)}>{authenticated ? 'Meu painel' : 'Criar conta'} <ArrowIcon /></Link>
      </nav>
    </div></header>

    <main>
      <section className="hero hero--platz" aria-labelledby="hero-title">
        <div className="hero__backdrop" />
        <div className="hero__content">
          <div className="hero__copy">
            <span className="eyebrow eyebrow--light"><span className="eyebrow__pulse" /> FEITO PARA QUEM VIVE NA AREIA</span>
            <h1 id="hero-title">Sua quadra.<br />Seu horário.<br /><em>Seu jogo.</em></h1>
            <p>Encontre arenas de beach tennis, futevôlei e vôlei de areia. Confira preço e disponibilidade sem precisar ligar.</p>
            <div className="hero__actions"><a className="button button--lime" href="#busca">Encontrar quadra <ArrowIcon /></a><a className="hero__text-link" href="#como-funciona">Como funciona <span aria-hidden="true">↓</span></a></div>
            <div className="hero__proof" aria-label="Vantagens ArenaGo"><span><b>01</b> Encontre</span><i /><span><b>02</b> Reserve</span><i /><span><b>03</b> Jogue</span></div>
          </div>
          <div className="hero__visual" aria-hidden="true"><div className="hero__photo" /><div className="hero__photo-accent" /><div className="hero__floating-card"><span className="hero__floating-icon">✳</span><div><strong>Areia, rede e sua galera.</strong><small>O próximo jogo começa aqui.</small></div><span className="hero__floating-arrow"><ArrowIcon /></span></div><div className="hero__tag"><span>QUADRAS</span><strong>DE AREIA</strong><small>Vem jogar.</small></div></div>
        </div>
        <div className="hero__stats"><span><strong>Busca de quadras cadastradas</strong><small>Arenas e preços publicados</small></span><i /><span><strong>Beach tennis em foco</strong><small>Futevôlei e vôlei também</small></span><i /><span><strong>Reserva online</strong><small>Consulte horários sem ligar</small></span></div>
      </section>

      <section className="search-section" id="busca">
        <div className="section search-section__inner">
          <div className="section-heading"><div><span className="eyebrow">BORA JOGAR?</span><h2>Encontre a quadra <em>ideal.</em></h2><p>Filtre arenas por região, esporte, data e horário — e escolha seu próximo jogo.</p></div><span className="search-count">{searched ? `${totalCourts} quadras encontradas` : 'CATÁLOGO DE ARENAS'}</span></div>
          <form className="search-panel search-panel--full" onSubmit={buscar} aria-label="Filtros para buscar quadras">
            <label className="search-field"><span className="search-field__icon"><PinIcon /></span><span className="search-field__content"><span>Cidade, arena ou quadra</span><input aria-label="Cidade, arena ou quadra" value={query.q} onChange={event => setQuery({ ...query, q: event.target.value })} placeholder="Ex.: Santos ou Arena Praia" /></span></label>
            <label className="search-field search-field--sport"><span className="search-field__icon search-field__icon--sport">✳</span><span className="search-field__content"><span>Esporte</span><select aria-label="Esporte" value={query.tipo} onChange={event => setQuery({ ...query, tipo: event.target.value })}>{sports.map(sport => <option key={sport.value || 'all'} value={sport.value}>{sport.label}</option>)}</select></span></label>
            <label className="search-field"><span className="search-field__icon search-field__icon--sport">◷</span><span className="search-field__content"><span>Quando</span><input aria-label="Data do jogo" type="date" min={new Date().toISOString().slice(0, 10)} value={query.data} onChange={event => setQuery({ ...query, data: event.target.value })} /></span></label>
            <label className="search-field search-field--time"><span className="search-field__content"><span>Horário inicial</span><input aria-label="Horário inicial" type="time" value={query.hora} onChange={event => setQuery({ ...query, hora: event.target.value })} /></span></label>
            <label className="search-field search-field--price"><span className="search-field__content"><span>Preço máximo / hora</span><input aria-label="Preço máximo por hora" type="number" min="0" step="0.01" value={query.precoMax} onChange={event => setQuery({ ...query, precoMax: event.target.value })} placeholder="Sem limite" /></span></label>
            <div className="search-panel__actions"><button type="button" className="search-reset" onClick={resetFilters}>Limpar filtros</button><button type="submit" className="button button--search" disabled={loading}><SearchIcon /><span>{loading ? 'Buscando...' : 'Buscar quadras'}</span></button></div>
          </form>
          {error && <p className="search-error" role="alert">{error}</p>}
          {searched ? <div className="search-results" aria-live="polite">
            {loading ? <div className="search-loading"><span className="loading-spinner" /> Buscando quadras disponíveis…</div> : venues.length ? venues.map(venue => <article className="venue-result" key={venue.id}>
              <div className="venue-result__heading"><span className="venue-result__icon">✳</span><div><h3>{venue.nome}</h3><p><PinIcon /> {venue.endereco}</p></div><span className="venue-result__count">{venue.quadras.length} {venue.quadras.length === 1 ? 'quadra' : 'quadras'}</span></div>
              <div className="venue-result__courts">{venue.quadras.map((court, index) => {
                const kona = venue.nome.trim().toLocaleLowerCase('pt-BR') === 'arena kona';
                const numberedCourt = Number(court.nome.match(/\b([12])\b/)?.[1]) || index + 1;
                const image = kona && court.tipo === 'BEACH_TENNIS' && numberedCourt <= 2
                  ? `/images/quadra-beach-${numberedCourt}.jpg`
                  : beachCourt;
                return <CourtCard key={court.id} venue={venue} court={court} image={image} authenticated={authenticated} bookingState={{ estabelecimentoId: venue.id, quadraId: court.id, data: filters.data, horarioInicio: filters.hora }} />;
              })}</div>
            </article>) : <div className="empty-results"><span aria-hidden="true">⌕</span><h3>Nenhuma quadra encontrada</h3><p>Tente remover um filtro, escolher outra data ou buscar em uma cidade diferente.</p><button type="button" className="button button--outline" onClick={resetFilters}>Limpar filtros</button></div>}
          </div> : <div className="search-intro"><span className="search-intro__icon">⌕</span><div><strong>Escolha seus filtros e busque quadras</strong><p>A busca mostra apenas arenas e quadras ativas cadastradas na plataforma.</p></div></div>}
        </div>
      </section>

      <section className="benefit-strip" aria-label="Benefícios ArenaGo"><div className="benefit-strip__item"><span className="benefit-strip__number">01</span><div><strong>Sem ligações e sem espera</strong><span>Encontre seu espaço direto por aqui.</span></div></div><div className="benefit-strip__item"><span className="benefit-strip__number">02</span><div><strong>Horário conferido</strong><span>Consulte disponibilidade antes de reservar.</span></div></div><div className="benefit-strip__item"><span className="benefit-strip__number">03</span><div><strong>Mais tempo em quadra</strong><span>Você cuida do saque. A gente da agenda.</span></div></div></section>

      <section className="how-section" id="como-funciona"><div className="how-section__inner"><div className="how-section__intro"><span className="eyebrow eyebrow--light">SIMPLES COMO DEVE SER</span><h2>Do “vamos jogar?”<br />ao <em>“partiu quadra”.</em></h2><p>Encontre a arena, escolha o horário e confirme a sua reserva em poucos passos.</p><Link className="button button--lime" to={authenticated ? '/nova-reserva' : '/cadastro'}>Agendar minha quadra <ArrowIcon /></Link></div><div className="how-steps"><article className="how-step"><span>01</span><div><h3>Encontre sua arena</h3><p>Busque por cidade, esporte, data e faixa de preço.</p></div><span className="how-step__symbol" aria-hidden="true"><SearchIcon /></span></article><article className="how-step"><span>02</span><div><h3>Escolha a quadra e o horário</h3><p>Confira a disponibilidade e os detalhes da quadra.</p></div><span className="how-step__symbol" aria-hidden="true">◷</span></article><article className="how-step"><span>03</span><div><h3>Confirme e entre em quadra</h3><p>Acompanhe sua reserva e comanda pela sua conta ArenaGo.</p></div><span className="how-step__symbol" aria-hidden="true">↗</span></article></div></div></section>

      <section className="final-cta"><div className="final-cta__orb" /><div><span className="eyebrow eyebrow--light">O PRÓXIMO JOGO COMEÇA AQUI</span><h2>Sua quadra. Seu horário.<br /><em>Seu jogo.</em></h2><p>Crie sua conta e organize sua próxima partida de areia.</p></div><Link className="button button--lime" to={authenticated ? '/nova-reserva' : '/cadastro'}>{authenticated ? 'Fazer uma reserva' : 'Criar minha conta'} <ArrowIcon /></Link></section>
    </main>

    <footer className="site-footer"><div className="site-footer__main"><div className="site-footer__brand"><Brand compact /><p>A plataforma feita para conectar você<br />à sua próxima partida na areia.</p></div><div className="site-footer__links"><div><strong>Encontre</strong><a href="#busca">Buscar quadras</a><a href="#como-funciona">Como funciona</a></div><div><strong>Sua conta</strong><Link to="/login">Entrar</Link><Link to="/cadastro">Criar conta</Link></div></div></div><div className="site-footer__bottom"><span>© {new Date().getFullYear()} ArenaGo. Feito para quem ama jogar.</span><span>BEACH TENNIS · FUTEVÔLEI · VÔLEI DE AREIA</span></div></footer>
  </div>;
}
