import { Component, OnInit, OnDestroy, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, stagger, query } from '@angular/animations';
import { SmoothTransitionService } from '../../services/smooth-transition.service';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
  animations: [
    trigger('sectionAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(50px) scale(0.95)' }),
        animate('1000ms ease-out', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ])
    ]),
    trigger('fadeInUp', [
      transition('hidden => visible', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerAnimation', [
      transition('hidden => visible', [
        query('.glass-card', [
          style({ opacity: 0, transform: 'translateY(30px)' }),
          stagger(200, [
            animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('sectionFadeIn', [
      transition('hidden => visible', [
        style({
          opacity: 0,
          transform: 'translateY(50px) scale(0.95)',
          filter: 'blur(10px)'
        }),
        animate('800ms cubic-bezier(0.25, 0.46, 0.45, 0.94)', style({
          opacity: 1,
          transform: 'translateY(0) scale(1)',
          filter: 'blur(0px)'
        }))
      ])
    ])
  ]
})
export class AboutComponent implements OnInit, OnDestroy {
  @ViewChild('aboutSection') sectionRef!: ElementRef;

  private transitionService = inject(SmoothTransitionService);

  animationState = 'hidden';
  isVisible = false;
  mouseX = 0;
  mouseY = 0;
  particles: Particle[] = [];

  skills = [
    { name: 'Angular', icon: '⚡' },
    { name: 'TypeScript', icon: '🚀' },
    { name: 'JavaScript', icon: '🎨' },
    { name: 'PHP', icon: '🌐' },
    { name: 'UI/UX', icon: '✨' },
    { name: 'Animation', icon: '🎭' }
  ];

  stats = [
    { value: '2+', label: 'Years Learning' },
    { value: '4+', label: 'Projects' },
    { value: '3+', label: 'Technologies' },
    { value: '∞', label: 'Passion' }
  ];

  private animationFrame!: number;
  private observer!: IntersectionObserver;

  ngOnInit() {
    // Configurar ID para el servicio de transiciones
    setTimeout(() => {
      if (this.sectionRef?.nativeElement) {
        this.sectionRef.nativeElement.id = 'about';
      }
    }, 0);

    this.initializeParticles();
    this.setupIntersectionObserver();
    this.setupTransitionObserver();
    this.animateParticles();

    // Pequeño delay para la entrada suave
    setTimeout(() => {
      this.animationState = 'visible';
    }, 100);
  }

  ngOnDestroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private setupTransitionObserver(): void {
    this.transitionService.currentSection$.subscribe(section => {
      const wasVisible = this.isVisible;
      this.isVisible = section === 'about';

      // Transición suave cuando la sección se vuelve visible
      if (!wasVisible && this.isVisible) {
        setTimeout(() => {
          this.animationState = 'visible';
        }, 200);
      }
    });
  }

  private initializeParticles() {
    this.particles = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.6 + 0.2
    }));
  }

  private animateParticles() {
    const animate = () => {
      this.particles.forEach(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x > 100) particle.x = 0;
        if (particle.x < 0) particle.x = 100;
        if (particle.y > 100) particle.y = 0;
        if (particle.y < 0) particle.y = 100;
      });

      this.animationFrame = requestAnimationFrame(animate);
    };
    animate();
  }

  private setupIntersectionObserver() {
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !this.isVisible) {
          this.transitionService.setCurrentSection('about');
        }
      },
      {
        threshold: 0.3,
        rootMargin: '-10% 0px -10% 0px'
      }
    );

    setTimeout(() => {
      if (this.sectionRef?.nativeElement) {
        this.observer.observe(this.sectionRef.nativeElement);
      }
    }, 100);
  }

  onMouseMove(event: MouseEvent) {
    if (this.sectionRef?.nativeElement) {
      const rect = this.sectionRef.nativeElement.getBoundingClientRect();
      this.mouseX = event.clientX - rect.left;
      this.mouseY = event.clientY - rect.top;
    }
  }

  trackByParticle(index: number, particle: Particle): number {
    return particle.id;
  }
}
