// フレームワークを使わない、軽量な画面のインタラクション。
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const themeButton = document.getElementById('theme');
function setTheme(dark) {
  document.body.classList.toggle('dark', dark);
  themeButton.textContent = dark ? '☀' : '☾';
  themeButton.setAttribute('aria-pressed', String(dark));
  themeButton.setAttribute('aria-label', dark ? 'ライトモードに切り替える' : 'ダークモードに切り替える');
  document.querySelector('meta[name="theme-color"]').content = dark ? '#17251e' : '#faf9f6';
}
try { setTheme(localStorage.getItem('linh-theme') === 'dark'); } catch { setTheme(false); }
themeButton.addEventListener('click', () => {
  const dark = !document.body.classList.contains('dark');
  setTheme(dark);
  try { localStorage.setItem('linh-theme', dark ? 'dark' : 'light'); } catch {}
});

const menuButton = document.getElementById('menu');
const navigation = document.getElementById('navigation');
function closeMenu() {
  navigation.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'メニューを開く');
  menuButton.textContent = '☰';
}
menuButton.addEventListener('click', () => {
  const open = navigation.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
  menuButton.textContent = open ? '×' : '☰';
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('open')) { closeMenu(); menuButton.focus(); }
});
document.addEventListener('click', event => { if (!event.target.closest('.header')) closeMenu(); });
window.matchMedia('(min-width: 701px)').addEventListener('change', closeMenu);

// JavaScriptが無効な場合も、すべての内容は表示されます。
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('in-view'); revealObserver.unobserve(entry.target); }
    });
  }, { threshold: 0.08 });
  document.documentElement.classList.add('js');
  document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));
}

const navLinks = [...navigation.querySelectorAll('a')];
const sections = navLinks.map(link => document.querySelector(link.getAttribute('href')));
const progress = document.querySelector('.scroll-progress');
const backTop = document.querySelector('.back-top');
let scrollQueued = false;
function updateScroll() {
  const height = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = 'scaleX(' + (height > 0 ? Math.min(1, Math.max(0, window.scrollY / height)) : 0) + ')';
  backTop.classList.toggle('visible', window.scrollY > 600);
  let current = '';
  sections.forEach(section => { if (section.getBoundingClientRect().top <= 150) current = section.id; });
  navLinks.forEach(link => {
    const active = link.getAttribute('href') === '#' + current;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
  });
  scrollQueued = false;
}
function queueScrollUpdate() { if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateScroll); } }
window.addEventListener('scroll', queueScrollUpdate, { passive: true });
window.addEventListener('resize', queueScrollUpdate);
updateScroll();

// マウスに合わせて、イラストを少しだけ動かします。
const art = document.querySelector('.hero-art');
art.addEventListener('pointermove', event => {
  if (reducedMotion.matches || event.pointerType !== 'mouse') return;
  const rect = art.getBoundingClientRect();
  art.style.setProperty('--art-x', ((event.clientX - rect.left) / rect.width - 0.5) * 9 + 'px');
  art.style.setProperty('--art-y', ((event.clientY - rect.top) / rect.height - 0.5) * 9 + 'px');
});
art.addEventListener('pointerleave', () => { art.style.setProperty('--art-x', '0px'); art.style.setProperty('--art-y', '0px'); });

const filterButtons = [...document.querySelectorAll('[data-filter]')];
const workCards = [...document.querySelectorAll('[data-category]')];
filterButtons.forEach(button => button.addEventListener('click', () => {
  const filter = button.dataset.filter;
  filterButtons.forEach(item => { const active = item === button; item.classList.toggle('active', active); item.setAttribute('aria-pressed', String(active)); });
  let count = 0;
  workCards.forEach(card => { card.hidden = filter !== 'all' && card.dataset.category !== filter; if (!card.hidden) { count++; card.classList.add('in-view'); } });
  document.getElementById('filter-status').textContent = button.textContent + '：' + count + '件を表示しています。';
  queueScrollUpdate();
}));
document.querySelectorAll('details').forEach(details => details.addEventListener('toggle', queueScrollUpdate));

const projectDialog = document.getElementById('project-dialog');
const detailsButton = document.getElementById('project-details');
detailsButton.addEventListener('click', () => { projectDialog.showModal(); document.body.classList.add('modal-open'); });
document.getElementById('close-dialog').addEventListener('click', () => projectDialog.close());
projectDialog.addEventListener('click', event => {
  const rect = projectDialog.getBoundingClientRect();
  if (event.target === projectDialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) projectDialog.close();
});
projectDialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); detailsButton.focus(); });

const copyButton = document.getElementById('copy-email');
copyButton.addEventListener('click', async () => {
  copyButton.disabled = true;
  const status = document.getElementById('copy-status');
  try {
    await navigator.clipboard.writeText('linhxteen3@gmail.com');
    status.textContent = 'メールアドレスをコピーしました。';
    copyButton.textContent = 'コピーしました ✓';
  } catch {
    status.textContent = 'コピーできませんでした。上のメールアドレスを選択してコピーしてください。';
  } finally { copyButton.disabled = false; }
});
document.getElementById('year').textContent = new Date().getFullYear();
