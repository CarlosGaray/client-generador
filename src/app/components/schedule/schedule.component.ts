import { Component } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';

import { FullCalendarModule } from '@fullcalendar/angular';

import { Calendar } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import esLocale from '@fullcalendar/core/locales/es';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ScheduleService } from '../../services/schedule.service';
import { Schelude } from '../../interfaces/schelude';

import { ChildComponent } from './child/child.component';


@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [
    FullCalendarModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ChildComponent
  ],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.css'
})
export class ScheduleComponent {

  url = 'https://server-generador.onrender.com/schedules';
  data!: any[];
  selectedState: string | undefined;
  selectedStateCode: string | undefined;
  datos!: any[];
  codigos: any[] = ['Seleccionar...'];
  codes!: any[];
  nameCourse: string | undefined;
  sections!: any[] | undefined;
  dataCourse!: any[] | undefined;
  selectedLabel: string | undefined;
  radioSeleccionado: string = '';
  chips: string[] = [];
  arrayPaint: any[] = [];

  calendarOptions: CalendarOptions = {};

  constructor() {
    this.calendarOptions = {
      plugins: [timeGridPlugin],
      slotMinTime: '08:00',
      slotMaxTime: '22:00',
      slotDuration: '01:00:00',
      hiddenDays: [0],
      expandRows: true,
      headerToolbar: {
        left: '',
        center: '',
        right: ''
      },
      initialView: 'timeGridWeek',
      navLinks: false,
      editable: false,
      selectable: false,
      nowIndicator: false,
      dayMaxEvents: false,
      locale: esLocale,
      allDaySlot: false,
      dayHeaderFormat: {
        weekday: 'short',
      },
      events: [],
      dayCellContent: function (arg: any) {
        if (arg.isToday) arg.isToday = false;
      },
    };
  }

  states = [
    { name: 'null', abbrev: 'Seleccionar...' },
    { name: '1', abbrev: 'PRIMER CICLO' },
    { name: '2', abbrev: 'SEGUNDO CICLO' },
    { name: '3', abbrev: 'TERCER CICLO' },
    { name: '4', abbrev: 'CUARTO CICLO' },
    { name: '5', abbrev: 'QUINTO CICLO' },
    { name: '6', abbrev: 'SEXTO CICLO' },
    { name: '7', abbrev: 'SÉPTIMO CICLO' },
    { name: '8', abbrev: 'OCTAVO CICLO' },
    { name: '9', abbrev: 'NOVENO CICLO' },
    { name: '10', abbrev: 'DÉCIMO CICLO' },
    { name: '11', abbrev: 'UNDÉCIMO CICLO' },
  ];

  async getScheludeLocationByCiclo(id: number){
    const response = await fetch(`${this.url}/${id}`);
    const data = await response.json();
    return data || {};
  }

  async getScheludeLocationByCode(code: string){
    const response = await fetch(`${this.url}/code/${code}`);
    const data = await response.json();
    return data || {};
  }

  async onSelectionCycle(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedState = target.value;

    this.datos = await this.getScheludeLocationByCiclo(Number(this.selectedState));

    this.codigos = this.datos.map(item => item.codigo);
    this.codigos.unshift('Seleccionar...');

  }

  async onSelectionCode(event: Event) {

    if(this.nameCourse){
      this.nameCourse = undefined;
    }

    const targetCode = event.target as HTMLSelectElement;
    this.selectedStateCode = targetCode.value;

    this.codes = await this.getScheludeLocationByCode(this.selectedStateCode);

    this.nameCourse = this.codes[0].nombre;
    this.sections = Object.keys(this.codes[0].secciones);

    if(this.dataCourse) {
      this.dataCourse = undefined;
    }
  }

  onRadioChange(event: any, section: string) {
    const label = event.target.nextSibling.textContent.trim();
    this.selectedLabel = label;
    this.dataCourse = this.codes[0].secciones[label];
    this.radioSeleccionado = section;
  }

  closeAlert() {
    this.nameCourse = undefined;
  }

  submitSection() {
    const indexToReplace = this.chips.findIndex(item => item.includes(`${this.codes[0].codigo}`));

    if(indexToReplace !== -1) {
      this.chips[indexToReplace] = `${this.codes[0].codigo} ${this.radioSeleccionado}`;
    }

    if(!this.chips.includes(`${this.codes[0].codigo} ${this.radioSeleccionado}`)){
      this.chips.push(`${this.codes[0].codigo} ${this.radioSeleccionado}`);
    }

  }

  eliminarChip(index: number) {
    this.chips.splice(index, 1);
  }

  async generateSchedule() {

    this.calendarOptions.events = [];

    const response = await fetch(`${this.url}/array`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(this.chips)
    });

    const data = await response.json();

    let arrayColors = [
      "#009f4d",
      "#a51890",
      "#0085ad",
      "#efdf00",
      "#84bd00",
      "#da1884",
      "#4285f4",
      "#ff9900",
    ];

    data.forEach((element: any) => {
      let color = arrayColors[Math.floor(Math.random() * arrayColors.length)];

      Object.values(element.secciones).forEach((section: any) => {
        section.forEach((item: any) => {

        const event: {
          title: string;
          daysOfWeek: string;
          startTime: string;
          endTime: string;
          color: string;
        } = {
          title: '',
          daysOfWeek: '',
          startTime: '',
          endTime: '',
          color: ''
        };

        event.title = element.codigo;
        const number = this.cursoDia(item.dia);
        event.daysOfWeek = number.toString();
        let [start, end] = item.hora.split('-');
        event.startTime = start;
        event.endTime = end;
        event.color = color;
        this.arrayPaint.push(event);
        })
      });
    });

    this.calendarOptions.events = this.arrayPaint;

    return true;

  }

  cursoDia(dia: string) {
    switch (dia) {
      case "LU":
        return 1;
      case "MA":
        return 2;
      case "MI":
        return 3;
      case "JU":
        return 4;
      case "VI":
        return 5;
      case "SA":
        return 6;
      default:
        return 0
    }
  }

}
