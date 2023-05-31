import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-visit',
  templateUrl: './visit.component.html',
  styleUrls: ['./visit.component.scss']
})
export class VisitComponent implements OnInit {
  visitData: any;
  VisitAcc: any;

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.VisitAcc = params.get('id');
    });
    this.visitData = history.state.data;
  }

  orders(){
    this.router.navigate([`visits/${this.visitData.Acc}/orders/0`],  { state: { VisitInfo: this.visitData} });
  }

  returns(){
    this.router.navigate([`visits/${this.visitData.Acc}/orders/1`],  { state: { VisitInfo: this.visitData } });
  }

  collect(){
    this.router.navigate(["/collect-cash"],  { state: { VisitInfo: this.visitData, } });
  }
}
