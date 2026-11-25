/********************TASKS****************** */
//bakhsh haye moshtarak mesle header va footer ro dar safahate mokhtalefe site load kone
// namayesh tedade ghazahaye sabade sefaresh

// fn async hast yani ghabeliate ejraye gheire hamzaman ro dare
// az try cache estefade kardim k betunim khata haro handle konim, code haie k momkene ba khata mivajeh bashan ro dakhele try gharar midim, va age khataie rokh bede varede bakhshe cache mishe
async function loadLayout() {
  try {
    //inja darim b browser migim file header.html ro begir beriz tuye headerResponse
    const headerResponse = await fetch("/src/components/header.html");
    // khoruji fetch html nist va ye object hast va ba method text() tabdil b string mikonim
    const headerHTML = await headerResponse.text();
    //hamun kari k baraye header kardim baraye footer ham mikonim
    const footerResponse = await fetch("/src/components/footer.html");
    const footerHTML = await footerResponse.text();
    //header va footer ro dakhele safe index.html daghighan dar jaue k id #header va #footer daran darj mikonim
    document.querySelector("#header").innerHTML = headerHTML;
    document.querySelector("#footer").innerHTML = footerHTML;
    //inja elam mikone header va footer darj shodan va payame layoutLoaded ro elam mikone(dar safahate dg az hamin payam estefade mikonim)
    document.dispatchEvent(new Event("layoutLoaded"));
    //baraye inke vaghti b safe dg mirim meghdare sefaresh bemune
    //etelate sefaresh ro migire az ls
    const orderItems = JSON.parse(localStorage.getItem("orderItems")) || [];

    //tag ba id #cart-count ro dar safe peida mikone
    const cartCount = document.querySelector("#cart-count");

    if (cartCount) {
      //tedade kole ghaza ro hesab mikone
      const count = orderItems.reduce(
        (total, item) => total + item.quantity,
        0,
      );
      //namayesh mide dar header
      cartCount.textContent = count.toLocaleString("fa-IR");
    }
  } catch (error) {
    //age khataie rokh dad dar console namayesh bede
    console.error("Layout loading error:", error);
  }
}
//ta ghable in faghat fn ro tarif kardim, hala call mikon k ejra beshe
loadLayout();
