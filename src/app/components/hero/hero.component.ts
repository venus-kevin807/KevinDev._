import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, sequence, stagger, query } from '@angular/animations';
import { SmoothTransitionService } from '../../services/smooth-transition.service';

declare var VANTA: any;

interface FloatingElement {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  type: 'circle' | 'square' | 'triangle';
}

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css'],
  animations: [
    trigger('heroEnter', [
      transition(':enter', [
        sequence([
          style({ opacity: 0, transform: 'scale(0.95)' }),
          animate('800ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            style({ opacity: 1, transform: 'scale(1)' }))
        ])
      ])
    ]),
    trigger('textReveal', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateY(50px) scale(0.8)',
          filter: 'blur(10px)'
        }),
        animate('1200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          style({
            opacity: 1,
            transform: 'translateY(0) scale(1)',
            filter: 'blur(0px)'
          })
        )
      ])
    ]),
    trigger('subtitleReveal', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateY(30px)',
          filter: 'blur(5px)'
        }),
        animate('800ms 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          style({
            opacity: 1,
            transform: 'translateY(0)',
            filter: 'blur(0px)'
          })
        )
      ])
    ]),
    trigger('scrollReveal', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateY(20px) scale(0.9)'
        }),
        animate('600ms 1000ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          style({
            opacity: 1,
            transform: 'translateY(0) scale(1)'
          })
        )
      ])
    ]),
    trigger('sectionFadeOut', [
      transition('visible => hidden', [
        animate('500ms ease-in', style({
          opacity: 0,
          transform: 'translateY(-30px) scale(0.98)'
        }))
      ])
    ])
  ]
})
export class HeroComponent implements OnInit, OnDestroy {
  @ViewChild('vanta') vantaRef!: ElementRef;
  @ViewChild('heroSection') heroSection!: ElementRef;

  private vantaEffect: any;
  private elementRef = inject(ElementRef);
  private transitionService = inject(SmoothTransitionService);
  private animationFrame!: number;
  private typingInterval!: any;

  // State variables
  mouseX = 0;
  mouseY = 0;
  currentTime = new Date();
  floatingElements: FloatingElement[] = [];
  isLoaded = false;
  isVisible = true;

  // Typing effect variables
  displayText = '';
  fullText = 'KEVIN CASTRO';
  typingIndex = 0;
  isTyping = true;

  // Skills rotation
  skills = [
    'Frontend Developer',
    'Software Engineering Student',
    'UI Design Lover',
    'Angular Specialist',
    'Creative Coder'
  ];
  currentSkillIndex = 0;
  displaySkill = '';
  skillTypingIndex = 0;
  isSkillTyping = true;

  ngOnInit(): void {
    // Configurar ID para el servicio de transiciones
    if (this.heroSection?.nativeElement) {
      this.heroSection.nativeElement.id = 'hero';
    }

    this.initializeVanta();
    this.initializeFloatingElements();
    this.startAnimations();
    this.startTypingEffect();
    this.startSkillRotation();
    this.updateTime();
    this.setupTransitionObserver();
    this.isLoaded = true;
  }

  ngOnDestroy(): void {
    if (this.vantaEffect) {
      this.vantaEffect.destroy();
    }
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
    }
  }

  private setupTransitionObserver(): void {
    this.transitionService.currentSection$.subscribe(section => {
      this.isVisible = section === 'hero';
    });
  }

  private initializeVanta(): void {
    setTimeout(() => {
      if (typeof VANTA?.GLOBE === 'function' && this.vantaRef?.nativeElement) {
        this.vantaEffect = VANTA.GLOBE({
          el: this.vantaRef.nativeElement,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 1.0,
          color: 0x00ffff,
          backgroundColor: 0x0a192f,
          size: 1.5,
          opacity: 0.8
        });
      }
    }, 100);
  }

  private initializeFloatingElements(): void {
    this.floatingElements = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 4,
      speed: Math.random() * 0.5 + 0.2,
      opacity: Math.random() * 0.6 + 0.2,
      type: ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)] as 'circle' | 'square' | 'triangle'
    }));
  }

  private startAnimations(): void {
    const animate = () => {
      this.floatingElements.forEach(element => {
        element.y -= element.speed;
        if (element.y < -10) {
          element.y = 110;
          element.x = Math.random() * 100;
        }
      });
      this.animationFrame = requestAnimationFrame(animate);
    };
    animate();
  }

  private startTypingEffect(): void {
    this.typingInterval = setInterval(() => {
      if (this.isTyping) {
        if (this.typingIndex < this.fullText.length) {
          this.displayText += this.fullText[this.typingIndex];
          this.typingIndex++;
        } else {
          this.isTyping = false;
          setTimeout(() => {
            this.isTyping = true;
            this.displayText = '';
            this.typingIndex = 0;
          }, 3000);
        }
      }
    }, 150);
  }

  private startSkillRotation(): void {
    setInterval(() => {
      if (this.isSkillTyping) {
        if (this.skillTypingIndex < this.skills[this.currentSkillIndex].length) {
          this.displaySkill += this.skills[this.currentSkillIndex][this.skillTypingIndex];
          this.skillTypingIndex++;
        } else {
          this.isSkillTyping = false;
          setTimeout(() => {
            this.displaySkill = '';
            this.skillTypingIndex = 0;
            this.currentSkillIndex = (this.currentSkillIndex + 1) % this.skills.length;
            this.isSkillTyping = true;
          }, 2000);
        }
      }
    }, 100);
  }

  private updateTime(): void {
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  onMouseMove(event: MouseEvent): void {
    if (this.heroSection?.nativeElement) {
      const rect = this.heroSection.nativeElement.getBoundingClientRect();
      this.mouseX = ((event.clientX - rect.left) / rect.width - 0.5) * 100;
      this.mouseY = ((event.clientY - rect.top) / rect.height - 0.5) * 100;
    }
  }

  trackByElement(index: number, element: FloatingElement): number {
    return element.id;
  }

  scrollToAbout(): void {
    this.transitionService.smoothScrollTo('about');
  }
}
