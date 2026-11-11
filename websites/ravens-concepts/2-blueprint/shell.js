import { PRODUCTS, ORDER } from "../shared/products.js";
const LOGO = `<svg viewBox="0 0 44 34" aria-hidden="true"><path d="M4 32 14 2h14a9 9 0 0 1 0 18h-9l12 12" fill="none" stroke="#0b1220" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><path d="M1 20h15" stroke="#1aa6e0" stroke-width="4" stroke-linecap="round"/></svg>`;
export function mountShell(active) {
  document.getElementById("hdr").innerHTML = `<nav class="wrap nav" aria-label="Main"><a class="brand" href="index.html">${LOGO}RAVENS TECH</a>
    <div class="links">${ORDER.map((k, i) => `<a href="product.html?p=${k}" class="${k === active ? "on" : ""}" style="--k:${PRODUCTS[k].accent}"><b>[0${i + 1}]</b> ${PRODUCTS[k].name}</a>`).join("")}<a href="index.html#tech">[04] Technology</a></div>
    <a class="btn" href="#contact">Contact →</a></nav>`;
  document.getElementById("contact").innerHTML = `<div class="wrap"><h2>Engineer your<br>venue with us</h2><div class="cols">
    <div><h4>Visit us</h4><p>Showroom address</p><p>City, Country</p></div>
    <div><h4>Get in touch</h4><a class="l" href="#">+000 000 000</a><a class="l" href="#">hello@ravenstech.example</a></div>
    <form onsubmit="event.preventDefault(); this.querySelector('button').textContent='Thanks, we\\'ll be in touch ✓'"><h4>Request a proposal</h4>
      <input placeholder="Full name*" required aria-label="Full name"><input type="email" placeholder="Work email*" required aria-label="Work email">
      <select aria-label="Product">${["All machines", ...ORDER.map((k) => PRODUCTS[k].name)].map((n) => `<option ${active && PRODUCTS[active].name === n ? "selected" : ""}>${n}</option>`).join("")}</select>
      <button class="btn">Send →</button></form></div>
    <div class="bar"><span>© Ravens Tech · Innovation in Automated Retail</span><span>Concept 2 · Blueprint</span></div></div>`;
}
