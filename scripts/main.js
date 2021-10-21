if (document.title.includes("House")) {
  fetchData("house")
  window.addEventListener("load", () => {
    const contenedor_loader = document.querySelector(".contenedor_loader")
    contenedor_loader.style.visibility = "hidden"
  })
} else if (document.title.includes("Senate")) {
  window.addEventListener("load", () => {
    const contenedor_loader = document.querySelector(".contenedor_loader")
    contenedor_loader.style.visibility = "hidden"
  })
  fetchData("senate")
}

function fetchData(endpoint) {
  fetch(`https://api.propublica.org/congress/v1/113/${endpoint}/members.json`, {
    headers: { "X-API-Key": "CKpOkI4covClaEHxsobiLysZnjwkfzQAasZWnJYh" },
  })
    .then((resolve) => resolve.json())
    .then((json) => {
      let data = [...json.results[0].members]
      console.log(data)
      myProgram(data)
    })
}

if (document.title == "TGIF - Home") {
  index_readBtn()
  function index_readBtn() {
    document.getElementById("read-btn").addEventListener("click", (e) => {
      let clicked = e.target
      if (clicked.innerText == "Read More") {
        clicked.innerText = "Read Less"
      } else {
        clicked.innerText = "Read More"
      }
    })
  }
}

const statistics = {
  // Democrats
  democrats: [],
  dem_votes: 0,
  dem_total_pct: 0,
  // Republicans
  republicans: [],
  rep_votes: 0,
  rep_total_pct: 0,
  // Independents
  independents: [],
  ind_votes: 0,
  ind_total_pct: 0,
  //General Info
  leastEngaged: [],
  mostEngaged: [],
  mostLoyal: [],
  leastLoyal: [],
}

function myProgram(data) {
  switch (document.title) {
    case "TGIF - House":
    case "TGIF - Senate":
      document.getElementById("selectState").addEventListener("change", (e) => {
        let selectedState = e.target.value
        filterState = selectedState
        renderTable()
      })

      let membersData = data

      var filterParty = ["R", "ID", "D"]
      var filterState = "All"
      var namesToShow = []
      var finalNames = []

      function readFilters() {
        if (filterState == "All") {
          namesToShow = membersData
        } else {
          namesToShow = membersData.filter(
            (member) => member.state === filterState
          )
        }

        finalNames = []
        namesToShow.forEach((member) => {
          let party = member.party
          if (party == "R" && filterParty.includes("R")) {
            finalNames.push(member)
          } else if (party == "ID" && filterParty.includes("ID")) {
            finalNames.push(member)
          } else if (party == "D" && filterParty.includes("D")) {
            finalNames.push(member)
          }
        })
      }

      function renderTable() {
        document.getElementById("tbody").innerHTML = ""
        readFilters()
        finalNames.forEach((member) => {
          let row = document.createElement("tr")
          let link = document.createElement("a")
          let names = `${member.last_name} ${member.first_name} ${
            member.middle_name || ""
          }`
          let td1 = document.createElement("td")
          let td2 = document.createElement("td")
          let td3 = document.createElement("td")
          let td4 = document.createElement("td")
          let td5 = document.createElement("td")
          link.href = member.url
          link.target = "_blank"
          link.innerText = names
          td2.innerText = member.party
          td3.innerText = member.state
          td4.innerText = member.seniority
          td5.innerText = member.votes_with_party_pct.toFixed(2) + "%"
          td1.appendChild(link)
          row.appendChild(td1)
          row.appendChild(td2)
          row.appendChild(td3)
          row.appendChild(td4)
          row.appendChild(td5)
          document.getElementById("tbody").appendChild(row)
        })
      }

      let states_filtered = []

      membersData.forEach((member) => {
        if (states_filtered.indexOf(member.state) === -1) {
          states_filtered.push(member.state)
        }
      })

      states_filtered.sort()

      states_filtered.forEach((state) => {
        let option = document.createElement("option")
        option.innerText = state
        option.value = state
        document.getElementById("selectState").appendChild(option)
      })

      renderTable()

      let inputs = document.getElementsByName("party")
      inputs = Array.from(inputs)
      inputs.forEach((input) => {
        input.addEventListener("change", (e) => {
          let selectedInput = e.target.value
          let checked = e.target.checked
          if (filterParty.includes(selectedInput)) {
            filterParty = filterParty.filter((party) => party !== selectedInput)
          } else if (!filterParty.includes(selectedInput) && checked) {
            filterParty.push(selectedInput)
          }
          renderTable()
        })
      })
      break
    case "TGIF - House Attendance":
    case "TGIF - Senate Attendance":
      statistics.democrats = data.filter((member) => member.party == "D")
      statistics.republicans = data.filter((member) => member.party == "R")
      statistics.independents = data.filter((member) => member.party == "ID")
      function missedVotes(party, votes) {
        let add = 0
        party.forEach((member) => {
          add = member[votes] + add
        })
        return add / party.length
      }

      function most_or_least(order, votes) {
        let membersCopy = [...data]
        if (order == "lower-high") {
          let orderedMembers = membersCopy.sort((a, b) => a[votes] - b[votes])
          let zeroVotes = orderedMembers.filter(
            (member) => member.total_votes >= 1
          )
          let tenMembers = Math.ceil((zeroVotes.length * 10) / 100)
          let lastMembers = zeroVotes.slice(0, tenMembers)
          return lastMembers
        } else {
          let orderedVotes = membersCopy.sort((a, b) => b[votes] - a[votes])
          let percentageVotes = Math.ceil((orderedVotes.length * 10) / 100)
          let slicedVotes = orderedVotes.slice(0, percentageVotes)
          return slicedVotes
        }
      }

      statistics.leastEngaged = most_or_least("high-low", "missed_votes_pct")
      statistics.mostEngaged = most_or_least("lower-high", "missed_votes_pct")

      statistics.dem_votes = missedVotes(
        statistics.democrats,
        "missed_votes_pct"
      )
      statistics.rep_votes = missedVotes(
        statistics.republicans,
        "missed_votes_pct"
      )
      statistics.ind_votes = missedVotes(
        statistics.independents,
        "missed_votes_pct"
      )
      function houseAtGlance() {
        document.getElementById("tbody_statistics").innerHTML = ""
        let row1 = document.createElement("tr")
        let row2 = document.createElement("tr")
        let row3 = document.createElement("tr")
        let row4 = document.createElement("tr")

        let td_party_rep = document.createElement("td")
        let td_republicans = document.createElement("td")
        let td_republicans_votes = document.createElement("td")
        td_party_rep.innerText = "Republicans"
        td_republicans.innerText = statistics.republicans.length
        td_republicans_votes.innerText = statistics.rep_votes.toFixed(2) + "%"

        let td_party_dem = document.createElement("td")
        let td_democrats = document.createElement("td")
        let td_democrats_votes = document.createElement("td")
        td_party_dem.innerText = "Democrats"
        td_democrats.innerText = statistics.democrats.length
        td_democrats_votes.innerText = statistics.dem_votes.toFixed(2) + "%"

        let td_party_ind = document.createElement("td")
        let td_independents = document.createElement("td")
        let td_independents_votes = document.createElement("td")
        td_party_ind.innerText = "Independents"
        td_independents_votes.innerText = "--"
        td_independents.innerText = statistics.independents.length || "0"

        let td_total = document.createElement("td")
        let td_total_votes = document.createElement("td")
        let td_total_missed = document.createElement("td")
        td_total.innerText = "Total"
        td_total_votes.innerText =
          statistics.democrats.length +
          statistics.republicans.length +
          statistics.independents.length
        td_total_missed.innerText = "--"

        row1.appendChild(td_party_dem)
        row1.appendChild(td_democrats)
        row1.appendChild(td_democrats_votes)
        row2.appendChild(td_party_rep)
        row2.appendChild(td_republicans)
        row2.appendChild(td_republicans_votes)
        row3.appendChild(td_party_ind)
        row3.appendChild(td_independents)
        row3.appendChild(td_independents_votes)
        row4.appendChild(td_total)
        row4.appendChild(td_total_votes)
        row4.appendChild(td_total_missed)
        document.getElementById("tbody_statistics").appendChild(row1)
        document.getElementById("tbody_statistics").appendChild(row2)
        document.getElementById("tbody_statistics").appendChild(row3)
        document.getElementById("tbody_statistics").appendChild(row4)
      }
      houseAtGlance()
      function leastEngaged() {
        document.getElementById("tbody_least_engage").innerHTML = ""
        statistics.leastEngaged.forEach((member) => {
          let row = document.createElement("tr")
          let link = document.createElement("a")
          let names = `${member.last_name} ${member.first_name} ${
            member.middle_name || ""
          }`
          let td1 = document.createElement("td")
          let td_missed_votes = document.createElement("td")
          let td_per_missed_votes = document.createElement("td")
          link.href = member.url
          link.target = "_blank"
          link.innerText = names
          td_missed_votes.innerText = member.missed_votes
          td_per_missed_votes.innerText =
            member.missed_votes_pct.toFixed(2) + "%"
          td1.appendChild(link)
          row.appendChild(td1)
          row.appendChild(td_missed_votes)
          row.appendChild(td_per_missed_votes)
          document.getElementById("tbody_least_engage").appendChild(row)
        })
      }
      leastEngaged()
      function mostEngaged() {
        document.getElementById("tbody_most_engage").innerHTML = ""
        statistics.mostEngaged.forEach((member) => {
          let row = document.createElement("tr")
          let link = document.createElement("a")
          let names = `${member.last_name} ${member.first_name} ${
            member.middle_name || ""
          }`
          let td1 = document.createElement("td")
          let td_most_votes = document.createElement("td")
          let td_per_missed_votes = document.createElement("td")
          link.href = member.url
          link.target = "_blank"
          link.innerText = names
          td_most_votes.innerText = member.missed_votes
          td_per_missed_votes.innerText =
            member.missed_votes_pct.toFixed(2) + "%"
          td1.appendChild(link)
          row.appendChild(td1)
          row.appendChild(td_most_votes)
          row.appendChild(td_per_missed_votes)
          document.getElementById("tbody_most_engage").appendChild(row)
        })
      }
      mostEngaged()
      break
    case "TGIF - House Loyalty":
    case "TGIF - Senate Loyalty":
      function loyaltyTable() {
        document.getElementById("tbody_loyalty").innerHTML = ""
        let row1 = document.createElement("tr")
        let row2 = document.createElement("tr")
        let row3 = document.createElement("tr")
        let row4 = document.createElement("tr")

        let td_party_rep = document.createElement("td")
        let td_republicans = document.createElement("td")
        let td_republicans_votes = document.createElement("td")
        td_party_rep.innerText = "Republicans"
        td_republicans.innerText = statistics.republicans.length
        td_republicans_votes.innerText =
          (
            votesR.reduce((a, b) => a + b) / statistics.democrats.length
          ).toFixed(2) + "%"

        let td_party_dem = document.createElement("td")
        let td_democrats = document.createElement("td")
        let td_democrats_votes = document.createElement("td")
        td_party_dem.innerText = "Democrats"
        td_democrats.innerText = statistics.democrats.length
        td_democrats_votes.innerText =
          (
            votesD.reduce((a, b) => a + b) / statistics.republicans.length
          ).toFixed(2) + "%"

        let td_party_ind = document.createElement("td")
        let td_independents = document.createElement("td")
        let td_independents_votes = document.createElement("td")
        td_party_ind.innerText = "Independents"
        td_independents_votes.innerText = "--"
        td_independents.innerText = statistics.independents.length || "0"

        let td_total = document.createElement("td")
        let td_total_votes = document.createElement("td")
        let td_total_missed = document.createElement("td")
        td_total.innerText = "Total"
        td_total_votes.innerText =
          statistics.democrats.length +
          statistics.republicans.length +
          statistics.independents.length
        td_total_missed.innerText = "--"

        row1.appendChild(td_party_dem)
        row1.appendChild(td_democrats)
        row1.appendChild(td_democrats_votes)
        row2.appendChild(td_party_rep)
        row2.appendChild(td_republicans)
        row2.appendChild(td_republicans_votes)
        row3.appendChild(td_party_ind)
        row3.appendChild(td_independents)
        row3.appendChild(td_independents_votes)
        row4.appendChild(td_total)
        row4.appendChild(td_total_votes)
        row4.appendChild(td_total_missed)
        document.getElementById("tbody_loyalty").appendChild(row1)
        document.getElementById("tbody_loyalty").appendChild(row2)
        document.getElementById("tbody_loyalty").appendChild(row3)
        document.getElementById("tbody_loyalty").appendChild(row4)
      }
      function leastLoyalMembers() {
        most_or_least()
        document.getElementById("tbody_least_loyal").innerHTML = ""
        statistics.leastLoyal.forEach((member) => {
          let row = document.createElement("tr")
          let link = document.createElement("a")
          let td1 = document.createElement("td")
          let names = `${member.last_name} ${member.first_name} ${
            member.middle_name || ""
          }`
          let td_n_missed_votes = document.createElement("td")
          let td_pct_votes = document.createElement("td")
          link.href = member.url
          link.target = "_blank"
          link.innerText = names
          td_n_missed_votes.innerText = (
            (member.total_votes * member.votes_with_party_pct) /
            100
          ).toFixed(0)
          td_pct_votes.innerText = member.votes_with_party_pct.toFixed(2) + "%"
          td1.appendChild(link)
          row.appendChild(td1)
          row.appendChild(td_n_missed_votes)
          row.appendChild(td_pct_votes)
          document.getElementById("tbody_least_loyal").appendChild(row)
        })
      }
      function mostLoyalMembers() {
        most_or_least()
        document.getElementById("tbody_most_loyal").innerHTML = ""
        statistics.mostLoyal.forEach((member) => {
          let row = document.createElement("tr")
          let link = document.createElement("a")
          let td1 = document.createElement("td")
          let names = `${member.last_name} ${member.first_name} ${
            member.middle_name || ""
          }`
          let td_n_missed_votes = document.createElement("td")
          let td_pct_votes = document.createElement("td")
          link.href = member.url
          link.target = "_blank"
          link.innerText = names
          td_n_missed_votes.innerText = (
            (member.total_votes * member.votes_with_party_pct) /
            100
          ).toFixed(0)
          td_pct_votes.innerText = member.votes_with_party_pct.toFixed(2) + "%"
          td1.appendChild(link)
          row.appendChild(td1)
          row.appendChild(td_n_missed_votes)
          row.appendChild(td_pct_votes)
          document.getElementById("tbody_most_loyal").appendChild(row)
        })
      }

      let votesD = []
      let votesR = []
      let votesID = []
      data.forEach((member) => {
        if (member.party == "R") {
          votesD.push(member.votes_with_party_pct)
        } else if (member.party == "D") {
          votesR.push(member.votes_with_party_pct)
        } else {
          votesID.push(member.votes_with_party_pct)
        }
      })
      if (votesID != 0) {
        statistics.ind_total_pct = (
          votesID.reduce((a, b) => a + b) / statistics.independents.length
        ).toFixed(2)
      } else {
        statistics.ind_total_pct = 0
      }
      statistics.democrats = data.filter((member) => member.party == "D")
      statistics.republicans = data.filter((member) => member.party == "R")
      statistics.independents = data.filter((member) => member.party == "ID")

      statistics.leastLoyal = most_or_least(
        "lower-high",
        "votes_with_party_pct"
      )
      statistics.mostLoyal = most_or_least("high-low", "votes_with_party_pct")

      leastLoyalMembers()
      mostLoyalMembers()
      loyaltyTable()
      break
  }
}
