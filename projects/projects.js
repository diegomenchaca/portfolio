import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

let query = '';
let selectedYear = null;

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
const projectsTitle = document.querySelector('.projects-title');

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let sliceGenerator = d3.pie().value((d) => d.value);
let colors = d3.scaleOrdinal(d3.schemeTableau10);

function getFilteredProjects() {
  return projects.filter((project) => {
    let matchesSearch = Object.values(project).join('\n').toLowerCase().includes(query.toLowerCase());
    let matchesYear = selectedYear === null || project.year == selectedYear;
    return matchesSearch && matchesYear;
  });
}

function renderPieChart(projectsData) {
  let svg = d3.select('svg');
  let legend = d3.select('.legend');

  svg.selectAll('path').remove();
  legend.selectAll('li').remove();

  let rolledData = d3.rollups(projectsData, (v) => v.length, (d) => d.year);
  let data = rolledData.map(([year, count]) => ({ value: count, label: year }));

  let arcData = sliceGenerator(data);
  let arcs = arcData.map((d) => arcGenerator(d));

  arcs.forEach((arc, idx) => {
    svg
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(idx))
      .attr('class', data[idx].label == selectedYear ? 'selected' : '')
      .on('click', () => {
        selectedYear = selectedYear == data[idx].label ? null : data[idx].label;
        svg.selectAll('path').attr('class', (_, i) => data[i].label == selectedYear ? 'selected' : '');
        legend.selectAll('li').attr('class', (_, i) => data[i].label == selectedYear ? 'selected' : '');
        let filtered = getFilteredProjects();
        renderProjects(filtered, projectsContainer, 'h2');
        projectsTitle.textContent = `Projects (${filtered.length})`;
      });
  });

  data.forEach((d, idx) => {
    legend
      .append('li')
      .attr('style', `--color:${colors(idx)}`)
      .attr('class', d.label == selectedYear ? 'selected' : '')
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
}

let searchFiltered = projects;
renderProjects(searchFiltered, projectsContainer, 'h2');
renderPieChart(searchFiltered);
projectsTitle.textContent = `Projects (${searchFiltered.length})`;

let searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('input', (event) => {
  query = event.target.value;
  searchFiltered = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });
  renderPieChart(searchFiltered);
  let filtered = getFilteredProjects();
  renderProjects(filtered, projectsContainer, 'h2');
  projectsTitle.textContent = `Projects (${filtered.length})`;
});
