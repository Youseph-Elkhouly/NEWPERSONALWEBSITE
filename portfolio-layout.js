// Keep the page fitted; expanded lists open over the layout without moving it.
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const icons = document.querySelector('.icon-buttons');
  const content = document.querySelector('.one-page');
  if (!header || !icons || !content) return;

  const screen = document.createElement('div');
  screen.className = 'portfolio-screen';
  header.before(screen);
  screen.append(header, icons, content);

  const sections = [...content.querySelectorAll(':scope > section')];
  sections.forEach(section => {
    const panel = section.querySelector('.acc-panel');
    const button = section.querySelector('.proj-viewmore');
    if (!panel || !button) return;
    const slot = document.createElement('div');
    slot.className = 'portfolio-panel-slot';
    panel.before(slot);
    slot.append(panel, button);
    panel.tabIndex = 0;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-label', section.querySelector('.acc-header')?.textContent.trim() || 'More items');
    button.setAttribute('aria-expanded', 'false');
    button.addEventListener('click', () => {
      const expanded = section.classList.contains('show-all');
      button.setAttribute('aria-expanded', String(expanded));
      if (expanded) {
        const rect = slot.getBoundingClientRect();
        slot.style.height = section.style.getPropertyValue('--portfolio-slot-height');
        const maxHeight = Math.min(420, window.innerHeight - 32);
        panel.style.setProperty('--expanded-left', `${rect.left}px`);
        panel.style.setProperty('--expanded-top', `${Math.max(16, Math.min(rect.top, window.innerHeight - maxHeight - 16))}px`);
        panel.style.setProperty('--expanded-width', `${rect.width}px`);
        panel.style.setProperty('--expanded-max-height', `${maxHeight}px`);
        panel.setAttribute('popover', 'manual');
        panel.append(button);
        panel.showPopover();
      } else {
        panel.hidePopover();
        panel.removeAttribute('popover');
        slot.append(button);
        slot.style.height = '';
      }
      panel.scrollTop = 0;
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && panel.matches(':popover-open')) button.click();
    });
    document.addEventListener('pointerdown', event => {
      if (panel.matches(':popover-open') && !panel.contains(event.target)) button.click();
    });
  });

  function fitPortfolio() {
    if (window.innerHeight < 48) return;
    sections.forEach(section => {
      const slot = section.querySelector('.portfolio-panel-slot');
      if (slot && !section.classList.contains('show-all')) {
        section.style.setProperty('--portfolio-slot-height', `${slot.offsetHeight}px`);
      }
    });
    const availableHeight = window.innerHeight - 12;
    const scale = Math.min(0.85, availableHeight / Math.max(1, screen.offsetHeight));
    screen.style.setProperty('--portfolio-scale', String(scale));
    const remainingSpace = Math.max(0, window.innerHeight - screen.offsetHeight * scale);
    const offset = remainingSpace / 2;
    screen.style.setProperty('--portfolio-offset', `${offset}px`);
    window.scrollTo(0, 0);
  }

  let pendingFrame;
  function scheduleFit() {
    cancelAnimationFrame(pendingFrame);
    pendingFrame = requestAnimationFrame(fitPortfolio);
  }
  new MutationObserver(scheduleFit).observe(content, {
    subtree: true, attributes: true, attributeFilter: ['class'], childList: true,
  });
  new ResizeObserver(scheduleFit).observe(screen);
  window.addEventListener('resize', scheduleFit);
  window.visualViewport?.addEventListener('resize', scheduleFit);
  screen.querySelectorAll('img').forEach(img => img.addEventListener('load', scheduleFit));
  document.fonts.ready.then(scheduleFit);
  scheduleFit();
});
