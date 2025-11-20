const inputPkm = document.getElementById('inputPkm');
const outputPkm = document.getElementById('outputPkm');
const sendPkm = document.getElementById('sendPkm');

sendPkm.addEventListener('click', () => {
    const queryName = inputPkm.value.trim().toLowerCase();
    if (queryName === '') {
        alert('Por favor, introduce el nombre de un Pokémon.');
        return;
    }

    outputPkm.innerHTML = '<p>Cargando...</p>';

    fetch(`https://pokeapi.co/api/v2/pokemon/${queryName}`)
        .then(resp => {
            if (!resp.ok) throw new Error('Pokémon no encontrado');
            return resp.json();
        })
        .then(pkmData => {
            outputPkm.innerHTML = '';

            // Tarjeta principal
            const card = document.createElement('div');
            card.classList.add('pkm-card');

            const title = document.createElement('h2');
            title.textContent = pkmData.name.toUpperCase();

            const img = document.createElement('img');
            img.src = pkmData.sprites.front_default || '';
            img.classList.add('pkm-img');
            if (!img.src) img.alt = 'Sin imagen';

            // Stats (conversiones)
            const weightP = document.createElement('p');
            weightP.classList.add('stat');
            weightP.innerHTML = `<strong>Peso:</strong> ${(pkmData.weight / 10).toFixed(1)} kg`;

            const heightP = document.createElement('p');
            heightP.classList.add('stat');
            heightP.innerHTML = `<strong>Altura:</strong> ${pkmData.height * 10} cm`;

            const typesP = document.createElement('p');
            typesP.classList.add('stat');
            typesP.innerHTML = `<strong>Tipos:</strong> ${pkmData.types.map(t => t.type.name).join(', ')}`;

            const statsRow = document.createElement('div');
            statsRow.classList.add('stats-row');
            statsRow.appendChild(weightP);
            statsRow.appendChild(heightP);
            statsRow.appendChild(typesP);

            // Botón shiny
            const shinyBtn = document.createElement('button');
            shinyBtn.textContent = 'Ver Shiny';
            shinyBtn.classList.add('shiny-btn');
            const normalSrc = img.src;
            const shinySrc = pkmData.sprites.front_shiny || normalSrc;

            shinyBtn.addEventListener('click', () => {
                if (shinyBtn.textContent === 'Ver Shiny') {
                    img.src = shinySrc;
                    shinyBtn.textContent = 'Ver Normal';
                } else {
                    img.src = normalSrc;
                    shinyBtn.textContent = 'Ver Shiny';
                }
            });

            // Contenedor evoluciones
            const evolucionesDiv = document.createElement('div');
            evolucionesDiv.classList.add('evolucionesDiv');
            const evoTitle = document.createElement('h3');
            evoTitle.textContent = 'Evoluciones';
            evoTitle.classList.add('evoTitle');
            evolucionesDiv.appendChild(evoTitle);

            // Agregar al DOM principal
            outputPkm.appendChild(card);
            card.appendChild(title);
            card.appendChild(img);
            card.appendChild(statsRow);
            card.appendChild(shinyBtn);
            card.appendChild(evolucionesDiv);

            // Fetch species -> evolution chain
            return fetch(pkmData.species.url)
                .then(r => r.json())
                .then(speciesData => fetch(speciesData.evolution_chain.url))
                .then(r => r.json())
                .then(chainData => {
                    const evoNames = [];
                    function extraer(chain) {
                        evoNames.push(chain.species.name);
                        chain.evolves_to.forEach(next => extraer(next));
                    }
                    extraer(chainData.chain);

                    // Crear tarjeta para cada evolución
                    evoNames.forEach(evoName => {
                        const evoCard = document.createElement('div');
                        evoCard.classList.add('evo-card');

                        const evoP = document.createElement('p');
                        const capName = evoName.charAt(0).toUpperCase() + evoName.slice(1).toLowerCase();
                        evoP.innerHTML = `<b>${capName}</b>`;
                        evoCard.appendChild(evoP);

                        fetch(`https://pokeapi.co/api/v2/pokemon/${evoName}`)
                            .then(r => r.json())
                            .then(evoData => {
                                const evoImg = document.createElement('img');
                                evoImg.src = evoData.sprites.front_default || '';
                                evoCard.appendChild(evoImg);

                                const evoBtn = document.createElement('button');
                                evoBtn.textContent = 'Shiny';
                                evoBtn.classList.add('evoShinyBtn');
                                const evoNormal = evoImg.src;
                                const evoShiny = evoData.sprites.front_shiny || evoNormal;

                                evoBtn.addEventListener('click', () => {
                                    evoImg.src = (evoImg.src === evoNormal) ? evoShiny : evoNormal;
                                });

                                evoCard.appendChild(evoBtn);
                            });

                        evolucionesDiv.appendChild(evoCard);
                    });
                });
        })
        .catch(err => {
            outputPkm.innerHTML = `<p style="color:red">${err.message}</p>`;
        });
});

inputPkm.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        sendPkm.click();
        console.log('Enter presionado');
    }
});