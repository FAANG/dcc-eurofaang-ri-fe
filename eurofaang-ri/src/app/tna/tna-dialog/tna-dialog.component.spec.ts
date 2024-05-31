import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TnaDialogComponent } from './tna-dialog.component';

describe('TnaDialogComponent', () => {
  let component: TnaDialogComponent;
  let fixture: ComponentFixture<TnaDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TnaDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TnaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
