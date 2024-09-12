document.addEventListener('DOMContentLoaded', () => {
    // Definição de variáveis e elementos
    const botaoAdicionarItem = document.getElementById('adicionar-item');
    const inputNomeItem = document.getElementById('nome-item');
    const listaItens = document.getElementById('lista-itens');
    const modalValor = document.getElementById('modal-valor');
    const botaoFecharModalValor = document.getElementById('fechar-modal-valor');
    const botaoConfirmarValor = document.getElementById('confirmar-valor');
    const totalCompras = document.getElementById('total-compras');
    const menuCabecalho = document.getElementById('menu-cabecalho');
    const dropdownCabecalho = document.getElementById('dropdown-cabecalho');
    const botaoExcluirLista = document.getElementById('excluir-lista');
    const botaoCompartilharWhatsApp = document.getElementById('compartilhar-whatsapp');
    const inputValorItem = document.getElementById('valor-item');

    // Inicialização das variáveis globais
    let itensMercadoArray = JSON.parse(localStorage.getItem('itensMercado')) || [];
    let subtotal = itensMercadoArray.reduce((soma, item) => soma + (item.noCarrinho ? item.total || 0 : 0), 0);

    // Função para formatar valores como moeda BRL
    function formatarMoeda(valor) {
        // Remove tudo que não é dígito
        valor = valor.replace(/\D/g, '');

        // Converte o valor para um inteiro e depois divide por 100 para formar a moeda
        valor = (parseInt(valor) / 100).toFixed(2);

        // Substitui o ponto decimal por vírgula
        valor = valor.replace('.', ',');

        // Adiciona pontos de milhar
        return valor.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    // Evento para formatar valor enquanto digita
    inputValorItem.addEventListener('input', (e) => {
        // Formata o valor digitado
        const valorFormatado = formatarMoeda(e.target.value);

        // Atualiza o campo de entrada com o valor formatado
        e.target.value = valorFormatado;
    });

    // Função para converter valor formatado para número
    function converterParaNumero(valorFormatado) {
        return parseFloat(valorFormatado.replace(/\./g, '').replace(',', '.'));
    }

    // Função para abrir o modal de valores
    function abrirModalValor(item) {
        limparCamposModalValor(); // Limpa os campos antes de abrir o modal
        modalValor.style.display = 'flex';
        botaoConfirmarValor.onclick = () => {
            const valor = converterParaNumero(document.getElementById('valor-item').value) || 0;
            const quantidade = valor > 0 ? (parseInt(document.getElementById('quantidade-item').value) || 1) : null;
            item.valor = valor;
            item.quantidade = quantidade;
            item.total = valor * (quantidade || 1);
            localStorage.setItem('itensMercado', JSON.stringify(itensMercadoArray));
            modalValor.style.display = 'none';
            mostrarNotificacao('Valor adicionado');
            carregarItens(); // Atualiza a lista para exibir o valor e quantidade
        };
    }   

    function limparCamposModalValor() {
        document.getElementById('valor-item').value = '';
        document.getElementById('quantidade-item').value = '';
    }   

    // Função para fechar o modal de valores
    function fecharModalValor() {
        modalValor.style.display = 'none';
        limparCamposModalValor(); // Limpa os campos do modal quando fechado
    }    

    // Função para mostrar notificação
    function mostrarNotificacao(mensagem) {
        const notificacao = document.createElement('div');
        notificacao.className = 'notificacao';
        notificacao.textContent = mensagem;
        document.body.appendChild(notificacao);
        setTimeout(() => notificacao.remove(), 2000);
    }

    // Função para carregar itens na lista de mercado
    function carregarItens() {
        listaItens.innerHTML = '';
        let separadorAdicionado = false;
        itensMercadoArray.forEach(item => {
            if (item.noCarrinho && !separadorAdicionado) {
                const hr = document.createElement('hr');
                listaItens.appendChild(hr);
                separadorAdicionado = true;
            }
            adicionarItemNaLista(item);
        });
        inputNomeItem.value = '';
        atualizarTotal(); // Atualiza o subtotal na página principal
    }

    // Função para adicionar item na lista
    function adicionarItemNaLista(item) {
        const itemContainer = document.createElement('div');
        itemContainer.className = 'item-container';
    
        const itemMercado = document.createElement('div');
        itemMercado.className = 'item-mercado';
    
        const titulo = document.createElement('div');
        titulo.className = 'titulo';
        titulo.textContent = `${item.nome}`;
    
        // Adiciona o botão de menu e dropdown de opções apenas se o item não estiver no carrinho
        if (!item.noCarrinho) {
            const menuOpcoes = document.createElement('button');
            menuOpcoes.className = 'menu-opcoes';
            menuOpcoes.innerHTML = '<i class="bx bx-dots-vertical-rounded"></i>';
            menuOpcoes.addEventListener('click', (e) => {
                e.stopPropagation();
                alternarDropdownOpcoes(itemContainer);
            });
    
            const dropdownOpcoes = document.createElement('div');
            dropdownOpcoes.className = 'dropdown-opcoes';
            dropdownOpcoes.innerHTML = `
                <button class="adicionar-valor">Adicionar Valor</button>
                <button class="remover">Excluir</button>
            `;
    
            dropdownOpcoes.querySelector('.adicionar-valor').addEventListener('click', (e) => {
                e.stopPropagation();
                abrirModalValor(item);
            });
    
            dropdownOpcoes.querySelector('.remover').addEventListener('click', (e) => {
                e.stopPropagation();
                removerItem(item);
            });
    
            itemMercado.appendChild(menuOpcoes);
            itemContainer.appendChild(dropdownOpcoes);
        }
    
        itemMercado.appendChild(titulo);
        itemContainer.appendChild(itemMercado);
    
        const containerWrapper = document.createElement('div');
        containerWrapper.className = 'item-wrapper';
        containerWrapper.appendChild(itemContainer);
    
        const botaoAdicionarAoCarrinho = document.createElement('button');
        botaoAdicionarAoCarrinho.className = item.noCarrinho ? 'botao-remover-carrinho' : 'botao-adicionar-carrinho';
        botaoAdicionarAoCarrinho.innerHTML = item.noCarrinho ? '<i class="bx bx-radio-circle-marked"></i>' : '<i class="bx bx-radio-circle"></i>';
        botaoAdicionarAoCarrinho.addEventListener('click', (e) => {
            e.stopPropagation();
            item.noCarrinho ? retornarParaListaPrincipal(item) : adicionarAoCarrinho(item);
        });
    
        containerWrapper.appendChild(botaoAdicionarAoCarrinho);
        listaItens.appendChild(containerWrapper);
    }    

    // Função para adicionar item ao carrinho
    function adicionarAoCarrinho(item) {
        item.noCarrinho = true;
        itensMercadoArray = itensMercadoArray.filter(i => i !== item);
        itensMercadoArray.push(item);
        subtotal += item.total || 0;
        localStorage.setItem('itensMercado', JSON.stringify(itensMercadoArray));
        mostrarNotificacao('Adicionado ao carrinho');
        carregarItens();
    }

    // Função para retornar item à lista principal
    function retornarParaListaPrincipal(item) {
        item.noCarrinho = false;
        itensMercadoArray = itensMercadoArray.filter(i => i !== item);
        itensMercadoArray.unshift(item);
        subtotal -= item.total || 0;
        localStorage.setItem('itensMercado', JSON.stringify(itensMercadoArray));
        mostrarNotificacao('Retornado à lista principal');
        carregarItens();
    }

    // Função para remover item da lista
    function removerItem(item) {
        itensMercadoArray = itensMercadoArray.filter(i => i !== item);
        if (item.noCarrinho) subtotal -= item.total || 0;
        localStorage.setItem('itensMercado', JSON.stringify(itensMercadoArray));
        carregarItens();
        mostrarNotificacao('Item removido');
    }

    // Função para alternar o dropdown de opções
    function alternarDropdownOpcoes(container) {
        const dropdown = container.querySelector('.dropdown-opcoes');
        dropdown.classList.toggle('ativo');
    }

    // Função para fechar dropdowns e modais ao clicar fora
    function fecharTodosDropdowns(e) {
        // Evita o fechamento do modal se o clique for dentro do modal-conteudo
        if (!e.target.closest('.modal-conteudo') && modalValor.style.display === 'flex') {
            fecharModalValor();
        }

        // Fecha dropdowns e outros modais
        if (!e.target.closest('#menu-cabecalho') && !e.target.closest('#dropdown-cabecalho') && !e.target.closest('.menu-opcoes') && !e.target.closest('.dropdown-opcoes')) {
            dropdownCabecalho.classList.remove('ativo');
            document.querySelectorAll('.dropdown-opcoes.ativo').forEach(dropdown => {
                dropdown.classList.remove('ativo');
            });
        }
    }

    // Função para atualizar o subtotal
    function atualizarTotal() {
        totalCompras.textContent = subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    // Evento para fechar o modal de valores
    botaoFecharModalValor.addEventListener('click', fecharModalValor);

    // Evento para adicionar item usando o campo de entrada
    botaoAdicionarItem.addEventListener('click', () => {
        const novoItem = inputNomeItem.value.trim();

        if (novoItem !== '') {
            const item = { nome: novoItem, marcado: false, valor: null, quantidade: null, total: 0, noCarrinho: false };
            itensMercadoArray.unshift(item);
            localStorage.setItem('itensMercado', JSON.stringify(itensMercadoArray));
            carregarItens();
        } else {
            mostrarAlertaCustom('Por favor, insira um nome para o item');
        }
    });

    // Função para alternar o dropdown do cabeçalho
    menuCabecalho.addEventListener('click', (e) => {
        e.stopPropagation(); // Previne o fechamento imediato ao clicar no botão
        dropdownCabecalho.classList.toggle('ativo');
    });

    // Função para excluir a lista
    botaoExcluirLista.addEventListener('click', () => {
        itensMercadoArray = [];
        subtotal = 0; //Zera o subtotal
        localStorage.removeItem('itensMercado');
        carregarItens();
        mostrarNotificacao('Lista excluída');
        dropdownCabecalho.classList.remove('ativo');
    });

// Função para compartilhar no WhatsApp
botaoCompartilharWhatsApp.addEventListener('click', () => {
    let mensagem = '*Minha lista de mercado:*\n\n';
    itensMercadoArray.forEach(item => {
        // Formatar quantidade e valor
        const quantidade = item.quantidade ? item.quantidade.toLocaleString('pt-BR') : '1';
        const valor = item.valor ? item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, style: 'currency', currency: 'BRL' }) : 'R$ 0,00';
        
        // Adicionar o item formatado com um hífen na frente
        mensagem += `- ${item.nome} - Qtd: ${quantidade}, Valor: ${valor}\n`;
    });
    
    // Formatar o total para a moeda brasileira
    const totalFormatado = subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });

    mensagem += `\n*Total: ${totalFormatado}*`;

    mensagem = encodeURIComponent(mensagem);
    window.location.href = `https://wa.me/?text=${mensagem}`;
    dropdownCabecalho.classList.remove('ativo');
});


    // Evento para fechar dropdowns e modais ao clicar fora
    document.addEventListener('click', fecharTodosDropdowns);

    // Carregar os itens da lista de mercado inicialmente
    carregarItens();
});

// Função para mostrar um alerta customizado
function mostrarAlertaCustom(mensagem) {
    // Cria o elemento de alerta
    const alerta = document.createElement('div');
    alerta.className = 'alerta-custom';
    alerta.textContent = mensagem;

    // Adiciona o alerta ao body
    document.body.appendChild(alerta);

    // Mostra o alerta com uma classe adicional
    setTimeout(() => {
        alerta.classList.add('mostrar');
    }, 10); // Pequeno delay para ativar a transição

    // Remove o alerta após 3 segundos
    setTimeout(() => {
        alerta.classList.remove('mostrar');
        setTimeout(() => alerta.remove(), 2000); // Remove completamente após a transição
    }, 2000);
}

document.querySelectorAll('button, input, select, textarea, a').forEach(element => {
    element.addEventListener('focus', (event) => {
        event.target.style.outline = 'none';
        event.target.style.boxShadow = 'none';
    });
});
