import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TnaViewComponent } from './tna-view.component';

describe('TnaViewComponent', () => {
  let component: TnaViewComponent;
  let fixture: ComponentFixture<TnaViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TnaViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TnaViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
