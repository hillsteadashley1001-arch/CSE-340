/* public/js/script.js */

/* 1) Respect reduced motion for any scripted scrolling */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* 2) Make entire upgrade cards keyboard-activatable (not just the inner link) */
function wireCardActivation() {
	const cards = document.querySelectorAll('.grid.upgrades .card');
	cards.forEach(card => {
		// Ensure card is focusable
		card.tabIndex = 0;

		// Use the first link inside as the action target
		const link = card.querySelector('a');
		if (!link) return;

		// Click through on Enter/Space
		card.addEventListener('keydown', e => {
			const isEnter = e.key === 'Enter';
			const isSpace = e.key === ' ';
			if (isEnter || isSpace) {
				e.preventDefault();
				link.click();
			}
		});

		// Also let clicks on the card (outside the image/text) activate
		card.addEventListener('click', e => {
			// Avoid double triggering when clicking the <a> itself
			if (e.target.closest('a')) return;
			link.click();
		});
	});
}

/* 3) Enhance the skip link: move focus to <main> and optionally smooth scroll */
function enhanceSkipLink() {
	const skip = document.querySelector('.skip-link');
	const main = document.querySelector('#main');
	if (!skip || !main) return;

	skip.addEventListener('click', () => {
		// Defer until after default jump so focus moves reliably
		requestAnimationFrame(() => {
			main.setAttribute('tabindex', '-1');
			main.focus({ preventScroll: true });
			if (!prefersReducedMotion) main.scrollIntoView({ behavior: 'smooth', block: 'start' });
			// Clean up tabindex so it’s not in the tab order permanently
			main.addEventListener('blur', () => main.removeAttribute('tabindex'), { once: true });
		});
	});
}

/* 4) Lazy-load images (defensive: set loading attr if not present) */
function ensureLazyLoading() {
	document.querySelectorAll('img').forEach(img => {
		if (!('loading' in HTMLImageElement.prototype)) return; // old browsers
		if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
	});
}

/* 5) Preload the large hero art only when the layout needs it */
function conditionalHeroPreload() {
	const mql = window.matchMedia('(min-width: 48rem)');
	const heroImg = document.querySelector('.hero-art img');
	if (!heroImg) return;

	function swapToLargeIfNeeded(e) {
		// If using a thumbnail with "-tn" and viewport is >= 48rem, swap to full image once.
		const isThumb = /-tn\.(jpe?g|png|webp|avif)$/i.test(heroImg.currentSrc || heroImg.src);
		if ((e.matches || mql.matches) && isThumb) {
			const fullSrc = heroImg.src.replace(/-tn(\.(jpe?g|png|webp|avif))$/i, '$1');
			// Only swap if the derived file name differs
			if (fullSrc !== heroImg.src) {
				const preloader = new Image();
				preloader.onload = () => { heroImg.src = fullSrc; };
				preloader.src = fullSrc;
			}
		}
	}

	// Run now and on changes
	swapToLargeIfNeeded(mql);
	if ('addEventListener' in mql) mql.addEventListener('change', swapToLargeIfNeeded);
	else mql.addListener(swapToLargeIfNeeded); // legacy Safari
}

/* 6) Keyboard focus outline visible on mouse users only when tabbing */
function focusVisiblePolyfill() {
	// Basic heuristic: add a class when using keyboard
	function onKey(e) {
		if (e.key === 'Tab') document.documentElement.classList.add('using-keyboard');
	}
	function onMouse() {
		document.documentElement.classList.remove('using-keyboard');
	}
	window.addEventListener('keydown', onKey, { passive: true });
	window.addEventListener('mousedown', onMouse, { passive: true });
	window.addEventListener('touchstart', onMouse, { passive: true });
}

/* Init after DOM is ready */
function init() {
	wireCardActivation();
	enhanceSkipLink();
	ensureLazyLoading();
	conditionalHeroPreload();
	focusVisiblePolyfill();
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', init);
} else {
	init();
}