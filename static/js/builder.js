const formations = [
  [['LW', 'CF', 'RW'], ['CM', 'CM', 'CM'], ['LB', 'CB', 'CB', 'RB'], ['GK']],
  [['ST', 'ST'], ['LM', 'CM', 'CM', 'RM'], ['LB', 'CB', 'CB', 'RB'], ['GK']],
  [
    ['ST'],
    ['LM', 'CAM', 'RM'],
    ['CDM', 'CDM'],
    ['LB', 'CB', 'CB', 'RB'],
    ['GK'],
  ],
];

const backdrop = document.querySelector('.backdrop');
const modal = document.querySelector('.modal');
const modalTitle = document.querySelector('.modal-title');
const pitch = document.querySelector('.pitch');
const roaster = document.querySelector('.roaster');
const createBtn = document.querySelector('.create-btn');
const inp = document.querySelector('.team-name');

let activeFormation = null;

function chooseFormation() {
  modal.classList.add('show');
  const ul = document.createElement('ul');
  modalTitle.innerText = 'Choose formation';
  ul.classList.add('formations-list');
  for (let formation of formations) {
    let fstring = '';
    formation
      .reverse()
      .slice(1)
      .forEach((arr) => (fstring += ` ${arr.length}`));
    const li = document.createElement('li');
    li.addEventListener('click', () => {
      activeFormationHandler(formation);
    });
    li.innerText = fstring;
    ul.append(li);
  }
  modal.append(ul);
}

function activeFormationHandler(formation) {
  closeBackdrop();
  activeFormation = formation;
  displayPositions();
  displayRoaster();
  console.log(activeFormation);
}

function displayPositions() {
  pitch.innerHTML = '';
  for (let formations of activeFormation.reverse()) {
    if (formations.length === 0) {
      if (formations[0].length < 4) {
        const pos = document.createElement('div');
        pos.addEventListener('click', () => {
          handleAddPlayer(position);
        });
        pos.classList.add('position');
        pos.innerText = formations[0];
        pitch.append(pos);
      } else {
        const player = document.createElement('p');
        player.innerText = formations[0];
        pitch.append(player);
      }
    } else {
      const posGroup = document.createElement('div');
      posGroup.classList.add('position-group');
      for (let position of formations) {
        console.log(position);
        if (position.length > 3) {
          const player = document.createElement('p');
          player.innerText = position;
          player.classList.add('player');
          posGroup.append(player);
        } else {
          const pos = document.createElement('div');
          pos.addEventListener('click', () => {
            handleAddPlayer(position);
          });
          pos.classList.add('position');
          pos.innerText = position;
          posGroup.append(pos);
        }
      }
      pitch.append(posGroup);
    }
  }
}

function handleAddPlayer(position) {
  openBackdrop();
  const title = document.createElement('h1');
  title.classList.add('modal-title');
  title.innerText = 'Loading ...';

  const players = document.createElement('ul');
  players.classList.add('available-players');

  modal.append(title);

  fetch(`http://127.0.0.1:5000/players/${position}`)
    .then((res) => res.json())
    .then((data) => {
      title.innerText = `Available ${position}'s`;
      for (let player of data) {
        const li = document.createElement('li');
        const playerUi = `
            <h2>${player[1]}</h2>
            <p>${player[3]}</p>
            <span>${player[4]}</span>
        `;
        li.innerHTML = playerUi;
        li.addEventListener('click', () => addIntoFormation(player));
        players.append(li);
      }
    });

  modal.append(players);
}

function addIntoFormation(player) {
  //   console.log(player, activeFormation);
  for (let i in activeFormation) {
    for (let j in activeFormation[i]) {
      if (activeFormation[i][j] === player[3]) {
        activeFormation[i][j] = player[1];
        activeFormation = activeFormation.reverse();
        displayPositions();
        displayRoaster();
        closeBackdrop();
        break;
      }
    }
  }
  console.log(activeFormation);
}

function closeBackdrop() {
  backdrop.style.display = 'none';
  modal.innerHTML = '';
}

function openBackdrop() {
  backdrop.style.display = 'block';
  modal.innerHTML = '';
}

function displayRoaster() {
  roaster.innerHTML = '';
  const posColors = {
    0: '#d90429',
    1: '#ffc300',
    2: '#0582ca',
    3: '#f72585',
  };
  for (let formation of activeFormation) {
    for (let player of formation) {
      if (player.length > 3) {
        const li = document.createElement('li');
        li.innerText = player;
        console.log(activeFormation.indexOf(formation));
        li.style.color = posColors[activeFormation.indexOf(formation)];
        roaster.append(li);
      }
    }
  }
}

createBtn.addEventListener('click', () => {
  console.log(inp.value, activeFormation);
  const team = {
    name: inp.value,
    squad: activeFormation,
  };
  fetch('http://127.0.0.1:5000/create-team', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(team),
  }).finally(() => (window.location = 'http://127.0.0.1:5000/'));
});

backdrop.addEventListener('click', () => {
  if (activeFormation) closeBackdrop();
});
modal.addEventListener('click', (e) => e.stopPropagation());

chooseFormation();
