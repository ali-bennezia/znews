import {
  Component,
  Input,
  Output,
  OnDestroy,
  OnInit,
  EventEmitter,
} from "@angular/core";
import { Subscription } from "rxjs";
import { SelectionService } from "src/app/interaction/selection.service";

@Component({
  selector: "app-dropdown-button",
  templateUrl: "./dropdown-button.component.html",
  styleUrls: ["./dropdown-button.component.css"],
})
export class DropdownButtonComponent implements OnInit, OnDestroy {
  showDropdown: boolean = false;
  @Input()
  choices!: string[];
  @Input()
  choiceValues!: string[];

  @Input()
  defaultChoice!: string;

  @Input()
  label!: string;
  @Input()
  appendChoice?: boolean;

  currentChoiceLabel: string = "";
  currentChoiceValue: string = "";

  @Output()
  choiceValueChanged: EventEmitter<string> = new EventEmitter<string>();

  private currentChoice_: number = 0;
  set currentChoice(c: number) {
    this.currentChoice_ = c;
    this.currentChoiceLabel = this.choices[this.currentChoice];
    this.currentChoiceValue = this.choiceValues[this.currentChoice];
    this.choiceValueChanged.emit(this.currentChoiceValue);
  }
  get currentChoice() {
    return this.currentChoice_;
  }

  interactionSub!: Subscription;

  constructor(private selService: SelectionService) {
    this.interactionSub = this.selService.onPageClick$.subscribe((e) => {
      if (
        !(
          e.target &&
          (e.target as any).className.includes("dropdownInteraction")
        )
      ) {
        this.showDropdown = false;
      }
    });
  }

  onClickChoice(i: number) {
    this.currentChoice = i;
    this.showDropdown = false;
  }

  ngOnInit(): void {
    this.currentChoice = this.choices.indexOf(this.defaultChoice);
    this.currentChoice == -1 ? (this.currentChoice = 0) : this.currentChoice;
    if (this.appendChoice == undefined) this.appendChoice = false;
  }

  ngOnDestroy(): void {
    this.interactionSub.unsubscribe();
  }
}
