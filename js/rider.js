// rider.js - Arpon
// rider dashboard, rider profile, earnings

// ---------- rider dashboard ----------
let online = false;
let deliveries = 0;
let earned = 0;
let active = null;   // the order the rider is delivering now

function showStats() {
  document.getElementById("deliveryCount").innerHTML = deliveries;
  document.getElementById("earnedText").innerHTML = "Tk " + earned;
  let status = document.getElementById("statusText");
  if (online) {
    status.innerHTML = "Online";
    status.style.color = "green";
  } else {
    status.innerHTML = "Offline";
    status.style.color = "grey";
  }
}

// ---------- form 1: go online ----------
function validateOnline() {
  clearErrors(["area", "vehicle", "confirm"]);
  let ok = true;
  let area = document.getElementById("area").value;
  let vehicle = document.getElementById("vehicle").value;

  if (area == "") {
    setError("area", "Please select your area");
    ok = false;
  }
  if (vehicle == "") {
    setError("vehicle", "Please select your vehicle");
    ok = false;
  }
  if (!document.getElementById("confirm").checked) {
    setError("confirm", "Please confirm that you are ready");
    ok = false;
  }
  if (ok) {
    online = true;
    showStats();
    document.getElementById("goOffline").style.display = "inline-block";
    showMessage("onlineMessage", "You are online in " + area + " with a " + vehicle + ".", "ok");
    showOrders(openOrders);
  } else {
    showMessage("onlineMessage", "Please fix the red fields.", "bad");
  }
  return false;
}

function goOffline() {
  online = false;
  showStats();
  document.getElementById("goOffline").style.display = "none";
  showMessage("onlineMessage", "You are offline now.", "ok");
  showOrders(openOrders);
}

// ---------- form 2: find open orders ----------
// DOM add: one order card is created and ADDED to the page for every order in the list
function showOrders(list) {
  let box = document.getElementById("orderList");
  box.innerHTML = "";   // clear the old cards first
  if (!online) {
    addNote(box, "Go online to see open orders");
    return;
  }
  if (active != null) {
    addNote(box, "Finish your active order first");
    return;
  }
  for (let i = 0; i < list.length; i++) {
    let o = list[i];
    let card = document.createElement("div");
    card.className = "order";
    card.id = "order" + o.id;
    card.innerHTML = "<p><b>Order #" + o.id + "</b> (" + o.type + ")</p>" +
      "<p>From: " + o.pickup + "</p>" +
      "<p>To: " + o.drop + "</p>" +
      "<p>" + o.distance + " km | Tk " + o.fare + "</p>";

    let btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-green btn-small";
    btn.innerHTML = "Accept";
    btn.onclick = function () {
      acceptOrder(o.id);
    };
    card.appendChild(btn);

    box.appendChild(card);   // ADD the card to the page
  }
  if (list.length == 0) {
    addNote(box, "No open orders match");
  }
}

// a small grey message line inside the order list
function addNote(box, text) {
  let p = document.createElement("p");
  p.className = "empty";
  p.innerHTML = text;
  box.appendChild(p);
}

function validateSearch() {
  clearErrors(["searchArea", "maxKm"]);
  let ok = true;
  let area = document.getElementById("searchArea").value;
  let type = document.getElementById("searchType").value;
  let maxKm = document.getElementById("maxKm").value;

  if (maxKm != "" && (Number(maxKm) <= 0 || Number(maxKm) > 50)) {
    setError("maxKm", "Distance must be between 1 and 50 km");
    ok = false;
  }
  if (!ok) {
    return false;
  }

  let result = [];
  for (let i = 0; i < openOrders.length; i++) {
    let o = openOrders[i];
    if (area != "all" && o.area != area) { continue; }
    if (type != "all" && o.type != type) { continue; }
    if (maxKm != "" && o.distance > Number(maxKm)) { continue; }
    result.push(o);
  }
  showOrders(result);
  return false;
}

// DOM remove: the accepted order card is REMOVED from the page
// and the order is removed from the openOrders array
function acceptOrder(id) {
  let card = document.getElementById("order" + id);
  if (card != null) {
    card.remove();   // REMOVE the card from the page
  }
  for (let i = 0; i < openOrders.length; i++) {
    if (openOrders[i].id == id) {
      active = openOrders[i];
      openOrders.splice(i, 1);   // remove it from the open list
      break;
    }
  }
  showOrders(openOrders);
  drawActive();
}

// the order the rider is delivering: one button moves it to the next status
let steps = ["Accepted", "Picked up", "On the way", "Delivered"];
let stepNumber = 0;

function drawActive() {
  let box = document.getElementById("activeBox");
  if (active == null) {
    box.innerHTML = "<p class='empty'>No active order</p>";
    return;
  }
  let html = "<div class='order'>";
  html += "<p><b>Order #" + active.id + "</b> (" + active.type + ")</p>";
  html += "<p>From: " + active.pickup + "</p>";
  html += "<p>To: " + active.drop + "</p>";
  html += "<p>Collect: Tk " + active.fare + "</p>";
  html += "<p>Status: <b>" + steps[stepNumber] + "</b></p>";
  if (stepNumber < 3) {
    html += "<button type='button' class='btn btn-small' onclick='nextStep()'>Mark as " + steps[stepNumber + 1] + "</button>";
  }
  html += "</div>";
  box.innerHTML = html;
}

function nextStep() {
  stepNumber++;
  if (stepNumber == 3) {
    // delivered
    deliveries++;
    earned += active.fare;
    showMessage("onlineMessage", "Order #" + active.id + " delivered. You earned Tk " + active.fare + ".", "ok");
    showStats();
    drawActive();
    active = null;
    stepNumber = 0;
    setTimeout(function () {
      drawActive();
      showOrders(openOrders);
    }, 1500);
    return;
  }
  drawActive();
}

// ---------- form 3: rider profile (rider-profile.html) ----------
function validateProfile() {
  clearErrors(["name", "phone", "vehicle", "plate", "bio", "license"]);
  let ok = true;
  let name = getValue("name");
  let phone = getValue("phone");
  let vehicle = document.getElementById("vehicle").value;
  let plate = getValue("plate");
  let bio = document.getElementById("bio").value;

  if (name == "") {
    setError("name", "Name is required");
    ok = false;
  } else if (!isName(name)) {
    setError("name", "Name can have only letters and spaces");
    ok = false;
  }
  if (!isPhone(phone)) {
    setError("phone", "Mobile must be 11 digits and start with 01");
    ok = false;
  }
  if (vehicle == "") {
    setError("vehicle", "Please select a vehicle");
    ok = false;
  }
  // a bicycle has no number plate, the others need one
  if (vehicle != "" && vehicle != "Bicycle" && plate == "") {
    setError("plate", "Number plate is required for this vehicle");
    ok = false;
  }
  if (bio.length > 150) {
    setError("bio", "Bio can be 150 characters at most");
    ok = false;
  }
  if (!document.getElementById("license").checked) {
    setError("license", "You must confirm your documents are valid");
    ok = false;
  }

  if (ok) {
    // show the saved data in the summary box
    document.getElementById("sumName").innerHTML = name;
    document.getElementById("sumPhone").innerHTML = phone;
    document.getElementById("sumVehicle").innerHTML = vehicle;
    document.getElementById("sumPlate").innerHTML = plate == "" ? "-" : plate;
    showMessage("profileMessage", "Profile updated.", "ok");
  } else {
    showMessage("profileMessage", "Please fix the red fields.", "bad");
  }
  return false;
}

// ---------- form 4: cash out (rider-earnings.html) ----------
// change the label when the method changes (onchange)
function changeMethod() {
  let method = document.getElementById("method").value;
  let label = document.getElementById("accountLabel");
  if (method == "bKash") {
    label.innerHTML = "bKash number";
  } else if (method == "Nagad") {
    label.innerHTML = "Nagad number";
  } else if (method == "Bank") {
    label.innerHTML = "Bank account number";
  } else {
    label.innerHTML = "Account number";
  }
}

function showBalance() {
  document.getElementById("balanceText").innerHTML = "Tk " + balance;
  let rows = "";
  for (let i = 0; i < cashoutHistory.length; i++) {
    let h = cashoutHistory[i];
    rows += "<tr><td>" + h.date + "</td><td>" + h.method + "</td><td>Tk " + h.amount + "</td></tr>";
  }
  document.getElementById("historyBody").innerHTML = rows;
}

function validateCashout() {
  clearErrors(["method", "account", "amount", "agree"]);
  let ok = true;
  let method = document.getElementById("method").value;
  let account = getValue("account");
  let amount = Number(document.getElementById("amount").value);

  if (method == "") {
    setError("method", "Please select a method");
    ok = false;
  }
  if (method == "bKash" || method == "Nagad") {
    if (!isPhone(account)) {
      setError("account", "Enter an 11 digit mobile number starting with 01");
      ok = false;
    }
  } else if (method == "Bank") {
    if (!/^[0-9]{10,16}$/.test(account)) {
      setError("account", "Bank account must be 10 to 16 digits");
      ok = false;
    }
  } else if (account == "") {
    setError("account", "Account number is required");
    ok = false;
  }
  if (amount < 100) {
    setError("amount", "Minimum cash out is Tk 100");
    ok = false;
  } else if (amount > balance) {
    setError("amount", "You only have Tk " + balance);
    ok = false;
  }
  if (!document.getElementById("agree").checked) {
    setError("agree", "Please tick the box to continue");
    ok = false;
  }

  if (ok) {
    balance = balance - amount;
    cashoutHistory.push({ date: "2026-11-23", method: method, amount: amount });
    document.getElementById("cashoutForm").reset();
    changeMethod();
    showBalance();
    showMessage("cashoutMessage", "Cash out of Tk " + amount + " requested.", "ok");
  } else {
    showMessage("cashoutMessage", "Please fix the red fields.", "bad");
  }
  return false;
}