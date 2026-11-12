/* Runs before first paint: flags that JS is available so progressive
   enhancements (scroll reveals, 3D viewer) can style themselves. */
document.documentElement.className = document.documentElement.className.replace(/\bno-js\b/, "js");
