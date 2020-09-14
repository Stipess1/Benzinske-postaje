import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PocetnaPage } from './pocetna.page';

describe('PocetnaPage', () => {
  let component: PocetnaPage;
  let fixture: ComponentFixture<PocetnaPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PocetnaPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PocetnaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
