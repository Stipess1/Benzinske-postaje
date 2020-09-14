import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { KartaComponent } from './karta.component';

describe('KartaComponent', () => {
  let component: KartaComponent;
  let fixture: ComponentFixture<KartaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KartaComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(KartaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
