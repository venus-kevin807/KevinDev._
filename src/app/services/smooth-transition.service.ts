// smooth-transition.service.ts
import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent, debounceTime } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SmoothTransitionService {
  private currentSection = new BehaviorSubject<string>('hero');
  private isTransitioning = new BehaviorSubject<boolean>(false);
  private transitionTimeout: any;
  private observer: IntersectionObserver | null = null;

  currentSection$ = this.currentSection.asObservable();
  isTransitioning$ = this.isTransitioning.asObservable();

  constructor(private ngZone: NgZone) {
    this.setupIntersectionObserver();
  }

  private setupIntersectionObserver() {
    // Ejecutar fuera de Angular Zone para mejor performance
    this.ngZone.runOutsideAngular(() => {
      const options = {
        root: null,
        rootMargin: '-20% 0px -20% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1]
      };

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const sectionId = entry.target.id;
            if (sectionId && sectionId !== this.currentSection.value) {
              this.ngZone.run(() => {
                this.setCurrentSection(sectionId);
              });
            }
          }
        });
      }, options);

      // Observar secciones después de que el DOM esté listo
      this.observeSections();
    });
  }

  private observeSections() {
    const checkSections = () => {
      const sections = document.querySelectorAll('section[id]');
      if (sections.length > 0) {
        sections.forEach(section => {
          if (this.observer) {
            this.observer.observe(section);
          }
        });
      } else {
        // Reintentar después de 500ms si no hay secciones
        setTimeout(checkSections, 500);
      }
    };

    checkSections();
  }

  setCurrentSection(section: string) {
    // Evitar transiciones múltiples simultáneas
    if (this.isTransitioning.value) {
      return;
    }

    this.isTransitioning.next(true);
    this.currentSection.next(section);

    // Limpiar timeout anterior si existe
    if (this.transitionTimeout) {
      clearTimeout(this.transitionTimeout);
    }

    // Garantizar que la transición termine después de un tiempo máximo
    this.transitionTimeout = setTimeout(() => {
      this.isTransitioning.next(false);
    }, 1200); // Aumentado a 1.2s para dar más tiempo
  }

  smoothScrollTo(elementId: string) {
    const element = document.getElementById(elementId);
    if (!element || this.isTransitioning.value) {
      return;
    }

    this.isTransitioning.next(true);

    // Usar requestAnimationFrame para mejor performance
    requestAnimationFrame(() => {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    });

    // Limpiar timeout anterior
    if (this.transitionTimeout) {
      clearTimeout(this.transitionTimeout);
    }

    // Finalizar transición
    this.transitionTimeout = setTimeout(() => {
      this.isTransitioning.next(false);
    }, 1200);
  }

  // Método para forzar el fin de transición si se queda cargando
  forceEndTransition() {
    if (this.transitionTimeout) {
      clearTimeout(this.transitionTimeout);
    }
    this.isTransitioning.next(false);
  }

  // Cleanup al destruir el servicio
  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.transitionTimeout) {
      clearTimeout(this.transitionTimeout);
    }
  }
}
