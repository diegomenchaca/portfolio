import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

let query = '';
let selectedIndex = -1;

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
const projectsTitle = document.querySelector('.projects-title');

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let sliceGenerator = d3.pie().value((d) => d.value);
let colors = d3.scaleOrdinal(d3.schemeTableau10);

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
      .on('click', () => {
        selectedIndex = selectedIndex === idx ? -1 : idx;
        svg.selectAll('path').attr('class', (_, i) => i === selectedIndex ? 'selected' : '');
        legend.selectAll('li').attr('class', (_, i) => i === selectedIndex ? 'selected' : '');

        if (selectedIndex === -1) {
          renderProjects(projectsData, projectsContainer, 'h2');
        } else {
          let selectedYear = data[selectedIndex].label;
          renderProjects(projectsData.filter(p => p.year == selectedYear), projectsContainer, 'h2');
        }
      });
  });

  data.forEach((d, idx) => {
    legend
      .append('li')
      .attr('style', `--color:${colors(idx)}`)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
}

renderProjects(projects, projectsContainer, 'h2');
renderPieChart(projects);
projectsTitle.textContent = `Projects (${projects.length})`;

let searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('input', (event) => {
  query = event.target.value;
  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });
  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects);
  projectsTitle.textContent = `Projects (${filteredProjects.length})`;
});
