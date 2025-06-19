import { Component, OnInit, OnDestroy, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, stagger, query, state } from '@angular/animations';
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

interface Experience {
  title: string;
  company: string;
  period: string;
  description: string;
  icon: string;
  technologies: string[];
  achievements: string[];
}

interface Skill {
  name: string;
  level: number; // 1-3 para el tamaño de la burbuja
}

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './experience.component.html',
  styleUrls: ['./experience.component.css'],
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
    trigger('timelineAnimation', [
      transition('hidden => visible', [
        style({ opacity: 0 }),
        animate('800ms ease-out', style({ opacity: 1 }))
      ])
    ]),
    trigger('timelineItemAnimation', [
      transition('hidden => visible', [
        style({
          opacity: 0,
          transform: 'translateX(-50px) scale(0.8)',
          filter: 'blur(5px)'
        }),
        animate('600ms ease-out', style({
          opacity: 1,
          transform: 'translateX(0) scale(1)',
          filter: 'blur(0px)'
        }))
      ])
    ])
  ]
})
export class ExperienceComponent implements OnInit, OnDestroy {
  @ViewChild('experienceSection') sectionRef!: ElementRef;

  private transitionService = inject(SmoothTransitionService);

  animationState = 'hidden';
  isVisible = false;
  mouseX = 0;
  mouseY = 0;
  particles: Particle[] = [];
  selectedExperience: number | null = null;
  timelineProgress = 0;

  experiences: Experience[] = [
        {
      title: 'First Steps in Programming',
      company: 'Self-Taught',
      period: '2021 - 2022',
      description: 'Started my journey learning programming fundamentals',
      icon: '🌱',
      technologies: ['HTML', 'CSS', 'Basic JavaScript'],
      achievements: [
        'My first "Hello World" program',
        'Learned programming fundamentals',
        'Discovered passion for web development'
      ]
    },
    {
      title: 'High school completed',
      company: 'COLEGIO VID',
      period: '2023',
      description: 'I finished my high school studies with a specialization in computer science.',
      icon: '🎓',
      technologies: [],
      achievements: [
        'Graduated',
        'Developed strong foundation in computer science',
        'Participated in school programming competitions',
        'Gained experience in teamwork'
      ]
    },
        {
      title: 'Graduated as a software development technician',
      company: 'CESDE',
      period: '2023 - 2024',
      description: 'I graduated as a technician in the area at 17 years old.',
      icon: '🎓',
      technologies: ['HTML', 'CSS', 'JavaScript', 'Java', 'SQL', 'Git', 'Python', 'Data Science'],
      achievements: [
        'Build different projects during my studies',
        'Learned programming fundamentals',
        'Discovered passion for web development',
        'Participated in team projects',
        'Gained experience in software development lifecycle'
      ]
    },
        {
      title: 'Frontend Developer',
      company: 'RENTING COLOMBIA',
      period: '2023 - 2024',
      description: 'I completed my internship as a software technician at this company, where I spent 6 months developing web applications using Angular.',
      icon: '💼',
      technologies: ['Angular', 'TypeScript', 'HTML', 'CSS', 'Azure DevOps', 'Azure Kubernetes Service'],
      achievements: [
        'Delivered 1 successful project',
        'Migarted legacy code to Angular',
        'Migrated the company\'s web applications to Azure Kubernetes Service',
        'Improved application performance and scalability',
      ]
    },
    {
      title: 'Software Engineering Student',
      company: 'TECNOLOGICO DE ANTIOQUIA',
      period: '2023 - Present',
      description: 'Learning computer science fundamentals and modern development practices',
      icon: '🎓',
      technologies: ['JavaScript', 'Python', 'MySQL', 'Git', 'HTML', 'CSS', 'Java'],
      achievements: [
        'Mastered object-oriented programming concepts',
        'Built database-driven applications'
      ]
    },
    {
      title: 'Freelance Developer',
      company: 'Self-Employed',
      period: '2025',
      description: 'Created custom websites and web applications for small businesses',
      icon: '💼',
      technologies: ['Angular', 'TypeScript', 'HTML', 'CSS', 'PHP', 'MySQL'],
      achievements: [
        'Delivered 2 successful projects',
        'Improved client online presence'
      ]
    }
  ];



  private animationFrame!: number;
  private observer!: IntersectionObserver;
  private progressInterval!: ReturnType<typeof setInterval>;

  ngOnInit() {
    setTimeout(() => {
      if (this.sectionRef?.nativeElement) {
        this.sectionRef.nativeElement.id = 'experience';
      }
    }, 0);

    this.initializeParticles();
    this.setupIntersectionObserver();
    this.setupTransitionObserver();
    this.animateParticles();
    this.animateTimelineProgress();

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
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
  }

  private setupTransitionObserver(): void {
    this.transitionService.currentSection$.subscribe(section => {
      const wasVisible = this.isVisible;
      this.isVisible = section === 'experience';

      if (!wasVisible && this.isVisible) {
        setTimeout(() => {
          this.animationState = 'visible';
        }, 200);
      }
    });
  }

  private initializeParticles() {
    this.particles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      speedX: (Math.random() - 0.5) * 0.2,
      speedY: (Math.random() - 0.5) * 0.2,
      opacity: Math.random() * 0.5 + 0.2
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

  private animateTimelineProgress() {
    let progress = 0;
    this.progressInterval = setInterval(() => {
      if (this.isVisible && progress < 100) {
        progress += 2;
        this.timelineProgress = progress;
      }
    }, 50);
  }

  private setupIntersectionObserver() {
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !this.isVisible) {
          this.transitionService.setCurrentSection('experience');
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

  selectExperience(index: number) {
    this.selectedExperience = this.selectedExperience === index ? null : index;
  }

  toggleExperience(index: number, event: Event) {
    event.stopPropagation();
    this.selectExperience(index);
  }

  trackByParticle(index: number, particle: Particle): number {
    return particle.id;
  }
}
