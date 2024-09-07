document.addEventListener('DOMContentLoaded', () => {
    const addItemBtn = document.getElementById('add-item-submit');
    const newItemInput = document.getElementById('item-name');
    const newQuantityInput = document.getElementById('item-quantity');
    const newDescriptionInput = document.getElementById('item-description');
    const itemList = document.getElementById('item-list');
    const itemsHeader = document.getElementById('items-header');
    const selectedCountElement = document.getElementById('selected-count');
    const contadorElement = selectedCountElement.querySelector('.contador');
    const selectAllBtn = document.getElementById('select-all-btn');
    const deleteSelectedBtn = document.getElementById('delete-selected-btn');
    const openModalBtn = document.getElementById('open-item-modal');
    const closeModalBtn = document.getElementById('close-item-modal');
    const itemModal = document.getElementById('item-modal');

    let itemListArray = JSON.parse(localStorage.getItem('itemList')) || [];
    let selectedItems = [];

    // Função para abrir o modal
    function openModal() {
        itemModal.style.display = 'flex';
    }

    // Função para fechar o modal
    function closeModal() {
        itemModal.style.display = 'none';
    }

    // Carrega os itens iniciais da lista de mercado
    function loadItems() {
        itemListArray.forEach(item => {
            addItemToList(item.name, item.quantity, item.description, item.checked);
        });
        updateHeader();
    }

    // Função para adicionar item na lista
    function addItemToList(name, quantity, description, checked = false) {
        const itemContainer = document.createElement('div');
        itemContainer.className = 'category-item-container';
        if (checked) itemContainer.classList.add('selected');

        const itemMercado = document.createElement('div');
        itemMercado.className = 'item-mercado';

        const titulo = document.createElement('div');
        titulo.className = 'titulo';
        titulo.textContent = name;

        const descricao = document.createElement('div');
        descricao.className = 'descricao';
        descricao.textContent = description;

        itemMercado.appendChild(titulo);
        itemMercado.appendChild(descricao);

        const quantidade = document.createElement('div');
        quantidade.className = 'quantidade';
        quantidade.textContent = `Qtd: ${quantity}`;

        itemContainer.appendChild(itemMercado);
        itemContainer.appendChild(quantidade);
        itemList.appendChild(itemContainer);

        itemContainer.addEventListener('click', () => {
            itemContainer.classList.toggle('selected');
            updateSelection(itemContainer);
        });
    }

    // Evento para adicionar item usando o modal
    addItemBtn?.addEventListener('click', () => {
        const newItem = newItemInput.value.trim();
        const newQuantity = newQuantityInput.value.trim();
        const newDescription = newDescriptionInput.value.trim();

        if (newItem !== '' && newQuantity !== '') {
            itemListArray.push({ name: newItem, quantity: newQuantity, description: newDescription, checked: false });
            addItemToList(newItem, newQuantity, newDescription);
            localStorage.setItem('itemList', JSON.stringify(itemListArray));
            closeModal();
        } else {
            alert('Por favor, insira um nome e quantidade para o item.');
        }
    });

    // Evento para abrir e fechar o modal
    openModalBtn?.addEventListener('click', openModal);
    closeModalBtn?.addEventListener('click', closeModal);

    // Evento para selecionar todos os itens
    selectAllBtn?.addEventListener('click', () => {
        const items = document.querySelectorAll('.category-item-container');
        const allSelected = items.length === selectedItems.length;

        selectedItems = [];

        items.forEach(item => {
            if (allSelected) {
                item.classList.remove('selected');
            } else {
                item.classList.add('selected');
                selectedItems.push(item);
            }
        });

        updateHeader();
    });

    // Evento para deletar itens selecionados
    deleteSelectedBtn?.addEventListener('click', () => {
        selectedItems.forEach(item => {
            const itemName = item.querySelector('.titulo').textContent;

            itemListArray = itemListArray.filter(i => i.name !== itemName);
            item.remove();
        });
        selectedItems = [];
        localStorage.setItem('itemList', JSON.stringify(itemListArray));
        updateHeader();
    });

    // Função para atualizar a seleção de itens
    function updateSelection(itemContainer) {
        const isSelected = itemContainer.classList.contains('selected');

        if (isSelected) {
            selectedItems.push(itemContainer);
        } else {
            selectedItems = selectedItems.filter(item => item !== itemContainer);
        }

        updateHeader();
    }

    // Função para remover um item
    function removeItem(container, name) {
        itemListArray = itemListArray.filter(item => item.name !== name);
        container.remove();
        localStorage.setItem('itemList', JSON.stringify(itemListArray));
        updateHeader();
    }

    // Função para atualizar o cabeçalho de seleção
    function updateHeader() {
        contadorElement.textContent = String(selectedItems.length).padStart(2, '0');
        itemsHeader.classList.toggle('visible', selectedItems.length > 0);
    }

    loadItems();
});
