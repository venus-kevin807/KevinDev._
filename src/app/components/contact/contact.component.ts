import { Component, OnInit, OnDestroy, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { trigger, transition, style, animate, stagger, query, keyframes } from '@angular/animations';
import { SmoothTransitionService } from '../../services/smooth-transition.service';
import emailjs from 'emailjs-com';

interface ContactInfo {
  icon: string;
  label: string;
  value: string;
  link?: string;
  type: 'email' | 'phone' | 'social' | 'location';
}

interface FloatingElement {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  color: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
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
        query('.contact-card, .form-field', [
          style({ opacity: 0, transform: 'translateY(30px)' }),
          stagger(100, [
            animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('formSubmit', [
      transition('idle => sending', [
        animate('300ms ease-in', keyframes([
          style({ transform: 'scale(1)', offset: 0 }),
          style({ transform: 'scale(0.95)', offset: 0.5 }),
          style({ transform: 'scale(1.05)', offset: 1 })
        ]))
      ]),
      transition('sending => success', [
        animate('500ms ease-out', keyframes([
          style({ transform: 'scale(1.05)', backgroundColor: '#10b981', offset: 0 }),
          style({ transform: 'scale(1)', backgroundColor: '#059669', offset: 1 })
        ]))
      ])
    ]),
    trigger('pulseAnimation', [
      transition('* => pulse', [
        animate('600ms ease-out', keyframes([
          style({ transform: 'scale(1)', opacity: 1, offset: 0 }),
          style({ transform: 'scale(1.1)', opacity: 0.8, offset: 0.5 }),
          style({ transform: 'scale(1)', opacity: 1, offset: 1 })
        ]))
      ])
    ])
  ]
})
export class ContactComponent implements OnInit, OnDestroy {
  @ViewChild('contactSection') sectionRef!: ElementRef;

  private transitionService = inject(SmoothTransitionService);
  private fb = inject(FormBuilder);

  animationState = 'hidden';
  isVisible = false;
  mouseX = 0;
  mouseY = 0;
  floatingElements: FloatingElement[] = [];
  contactForm: FormGroup;
  formState: 'idle' | 'sending' | 'success' | 'error' = 'idle';
  pulseState = '';

  contactInfo: ContactInfo[] = [
    {
      icon: '📧',
      label: 'Email',
      value: 'kevincastrogomez56@gmail.com',
      link: 'mailto:kevincastrogomez56@gmail.com',
      type: 'email'
    },
    {
      icon: '📱',
      label: 'Phone',
      value: '+57 300 801 4847',
      link: 'tel:+573008014847',
      type: 'phone'
    },
    {
      icon: '💼',
      label: 'LinkedIn',
      value: 'Kevin Castro',
      link: 'https://www.linkedin.com/in/kevin-castro-46065a307/',
      type: 'social'
    },
    {
      icon: '🚀',
      label: 'GitHub',
      value: 'venus-kevin807',
      link: 'https://github.com/venus-kevin807',
      type: 'social'
    },
    {
      icon: '📍',
      label: 'Location',
      value: 'Medellín, Colombia',
      type: 'location'
    }
  ];

  private animationFrame!: number;
  private observer!: IntersectionObserver;

  constructor() {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.minLength(5)]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit() {
    setTimeout(() => {
      if (this.sectionRef?.nativeElement) {
        this.sectionRef.nativeElement.id = 'contact';
      }
    }, 0);

    this.initializeFloatingElements();
    this.setupIntersectionObserver();
    this.setupTransitionObserver();
    this.animateFloatingElements();

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
      this.isVisible = section === 'contact';

      if (!wasVisible && this.isVisible) {
        setTimeout(() => {
          this.animationState = 'visible';
        }, 200);
      }
    });
  }

  private initializeFloatingElements() {
    const colors = ['#06b6d4', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];
    this.floatingElements = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 2,
      speed: Math.random() * 0.5 + 0.1,
      opacity: Math.random() * 0.4 + 0.1,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
  }

  private animateFloatingElements() {
    const animate = () => {
      this.floatingElements.forEach(element => {
        element.y -= element.speed;
        if (element.y < -5) {
          element.y = 105;
          element.x = Math.random() * 100;
        }
      });
      this.animationFrame = requestAnimationFrame(animate);
    };
    animate();
  }

  private setupIntersectionObserver() {
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !this.isVisible) {
          this.transitionService.setCurrentSection('contact');
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

  onContactClick(contact: ContactInfo) {
    this.pulseState = 'pulse';
    setTimeout(() => this.pulseState = '', 600);

    if (contact.link) {
      if (contact.type === 'social') {
        window.open(contact.link, '_blank');
      } else {
        window.location.href = contact.link;
      }
    }
  }

  async onSubmit() {
    if (this.contactForm.valid && this.formState === 'idle') {
      this.formState = 'sending';

      try {
        await this.sendEmailJS();
        this.formState = 'success';
        this.contactForm.reset();
        setTimeout(() => this.formState = 'idle', 3000);
      } catch (error) {
        console.error('Error al enviar mensaje:', error);
        this.formState = 'error';
        setTimeout(() => this.formState = 'idle', 3000);
      }
    } else {
      Object.keys(this.contactForm.controls).forEach(key => {
        this.contactForm.get(key)?.markAsTouched();
      });
    }
  }

private async sendEmailJS(): Promise<void> {
  const { name, email, subject, message } = this.contactForm.value;

  await emailjs.send(
    'service_pdw9sm5',
    'template_bq01ohd',
    { name, email, subject, message },
    '9NhBNrjvKt_6HvtGN'
  );
}


  getFieldError(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    if (field?.touched && field?.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email';
      if (field.errors['minlength']) return `${fieldName} is too short`;
    }
    return '';
  }

  trackByElement(index: number, element: FloatingElement): number {
    return element.id;
  }

  trackByContact(index: number, contact: ContactInfo): string {
    return contact.label;
  }
}
