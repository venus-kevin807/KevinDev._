import { Component, OnInit, OnDestroy, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, stagger, query } from '@angular/animations';
import { SmoothTransitionService } from '../../services/smooth-transition.service';

interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  image: string;
  technologies: string[];
  githubUrl: string;
  liveUrl?: string;
  featured: boolean;
}

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
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css'],
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
    trigger('staggerCards', [
      transition('hidden => visible', [
        query('.project-card', [
          style({ opacity: 0, transform: 'translateY(50px) scale(0.9)' }),
          stagger(150, [
            animate('800ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('filterAnimation', [
      transition('* => *', [
        query('.project-card', [
          style({ opacity: 0, transform: 'scale(0.8)' }),
          stagger(100, [
            animate('400ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class ProjectsComponent implements OnInit, OnDestroy {
  @ViewChild('projectsSection') sectionRef!: ElementRef;

  private transitionService = inject(SmoothTransitionService);

  animationState = 'hidden';
  isVisible = false;
  mouseX = 0;
  mouseY = 0;
  particles: Particle[] = [];
  currentFilter = 'all';

  projects: Project[] = [
    {
      id: 1,
      title: 'MONTACARGAS Y REPUESTOS S.A.S CATALOG',
      description: 'A catalog showing forklift spare parts. Made for a small business in Medellín.',
      category: 'fullstack',
      image: 'banner-montacargas.jpg',
      technologies: ['Angular', 'TypeScript', 'Bootstrap', 'CSS', 'PHP'],
      githubUrl: 'https://github.com/venus-kevin807/CatalogoMyR',
      liveUrl: 'https://montacargasyrepuestossas.com/',
      featured: true
    },
    {
      id: 2,
      title: 'MONTACARGAS Y REPUESTOS S.A.S CATALOG INVENTORY',
      description: 'A full-stack inventory management system for the same business, allowing them to manage their spare parts effectively. (PRIVATE REPOSITORY)',
      category: 'fullstack',
      image: 'banner-montacargas.jpg',
      technologies: ['Angular', 'TypeScript', 'Bootstrap', 'CSS', 'PHP'],
      githubUrl: 'https://github.com/venus-kevin807/InventarioMYR',
      featured: true
    },
    {
      id: 3,
      title: 'MoviesWeb',
      description: 'Aplicación personal donde publicaba peliculas atraves de alguna nube y podia verlas.',
      category: 'web',
      image: 'cine.jpg',
      technologies: ['HTML5', 'CSS3', 'TypeScript', 'TailwindCSS', 'PHP'],
      githubUrl: 'https://github.com/venus-kevin807/MoviesWeb',
      featured: false
    },
    {
      id: 4,
      title: 'Gifs App',
      description: 'A small app that consumes an external API. It has a variety of GIFs, and you can filter them.',
      category: 'web',
      image: 'gif.gif',
      technologies: ['Angular', 'TypeScript', 'Bootstrap', 'CSS', 'Giphy API'],
      githubUrl: 'https://github.com/venus-kevin807/03-gifs-app',
      featured: true
    },
    {
      id: 5,
      title: 'Task Management App',
      description: 'A small application made with HTML, CSS, and pure JavaScript. Created while I was studying software development.',
      category: 'app',
      image: 'Task.jpg',
      technologies: ['HTML5', 'CSS', 'JavaScript'],
      githubUrl: 'https://github.com/venus-kevin807/Lista-de-Tareas-WEB-ll-Kevin-Castro',
      featured: false
    },

  ];

  filteredProjects: Project[] = [];
  categories = [
    { key: 'all', label: 'All Projects', icon: '🚀' },
    { key: 'web', label: 'Web Development', icon: '🌐' },
    { key: 'fullstack', label: 'Full Stack', icon: '⚡' }
  ];

  private animationFrame!: number;
  private observer!: IntersectionObserver;

  ngOnInit() {
    // Configurar ID para el servicio de transiciones
    setTimeout(() => {
      if (this.sectionRef?.nativeElement) {
        this.sectionRef.nativeElement.id = 'projects';
      }
    }, 0);

    this.initializeParticles();
    this.setupIntersectionObserver();
    this.setupTransitionObserver();
    this.animateParticles();
    this.filterProjects('all');

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
      this.isVisible = section === 'projects';

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
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 0.2,
      speedY: (Math.random() - 0.5) * 0.2,
      opacity: Math.random() * 0.5 + 0.1
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
          this.transitionService.setCurrentSection('projects');
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

  filterProjects(category: string) {
    this.currentFilter = category;
    if (category === 'all') {
      this.filteredProjects = [...this.projects];
    } else {
      this.filteredProjects = this.projects.filter(project => project.category === category);
    }
  }

  onMouseMove(event: MouseEvent) {
    if (this.sectionRef?.nativeElement) {
      const rect = this.sectionRef.nativeElement.getBoundingClientRect();
      this.mouseX = (event.clientX - rect.left) / rect.width * 100;
      this.mouseY = (event.clientY - rect.top) / rect.height * 100;
    }
  }

  trackByParticle(index: number, particle: Particle): number {
    return particle.id;
  }

  trackByProject(index: number, project: Project): number {
    return project.id;
  }

  openGithub(url: string) {
    window.open(url, '_blank');
  }

  openLive(url: string) {
    window.open(url, '_blank');
  }
}
