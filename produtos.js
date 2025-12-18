const produtos = [
  {
    categoria: "Hambúrgueres tradicionais",
    produtos: [
      {
        nome: "X-egg",
        descricao: "Pão de brioche, molho da casa, alface, tomate, batata palha, bife tradicional 56g, mussarela e ovo",
        preco: 15.00,
        imagem: "img/x-egg.jpg"
      },
      {
        nome: "X-salada",
        descricao: "Pão de brioche, molho da casa, alface, tomate, batata palha, bife tradicional 56g e mussarela",
        preco: 13.00,
        imagem: "img/x-salada.jpg"
      },
      {
        nome: "American burg",
        descricao: "Pão de brioche, molho da casa, alface, tomate, bife tradicional 56g, cheddar, bacon, catupiry, cebola empanada e molho barbecue",
        preco: 17.00,
        imagem: "img/american-burg.jpg"
      },
      {
        nome: "X-bacon",
        descricao: "Pão de brioche, molho da casa, alface, tomate, batata palha, bife tradicional 56g, mussarela e bacon",
        preco: 16.50,
        imagem: "img/x-bacon.jpg"
      },
      {
        nome: "Hamburguer",
        descricao: "Pão de brioche, molho da casa, alface, tomate, batata palha, bife tradicional 56g",
        preco: 11.50,
        imagem: "img/hamburguer.jpg"
      },
      {
        nome: "X-tudo",
        descricao: "Pão de brioche, molho da casa, alface, tomate, batata palha, bife tradicional 56g, mussarela, bacon, ovo e presunto",
        preco: 19.50,
        imagem: "img/x-tudo.jpg"
      },
      {
        nome: "X-Tudão",
        descricao: "Pão de brioche, molho da casa, alface, tomate, batata palha, bife tradicional 56g, mussarela, bacon, presunto, ovo, onion rings e catupiry",
        preco: 26.00,
        imagem: "img/x-tudao.jpg"
      },
      {
        nome: "X-egg bacon",
        descricao: "Pão de brioche, molho da casa, alface, tomate, batata palha, bife tradicional 56g, mussarela, bacon e ovo",
        preco: 18.50,
        imagem: "img/x-egg-bacon.jpg"
      }
    ]
  },
  {
    categoria: "Artesanais de 150g",
    produtos: [
      {
        nome: "Caramelizada gourmet",
        descricao: "Pão de brioche, cebola caramelizada, bife de 150g, cheddar fatia e catupiry",
        preco: 23.00,
        imagem: "img/caramelizada-gourmet.jpg"
      },
      {
        nome: "Sunrise",
        descricao: "Pão de brioche, molho americano, alface, bife artesanal de 150g, mussarela, bacon, abacaxi e molho barbecue",
        preco: 28.50,
        imagem: "img/sunrise.jpg"
      },
      {
        nome: "Voraz",
        descricao: "Pão de brioche, molho americano, cebola roxa, picles, 2 bifes artesanais de 150g, 2 fatias de cheddar, 2 fatias de mussarela e bacon",
        preco: 34.50,
        imagem: "img/voraz.jpg"
      },
      {
        nome: "X-saladão",
        descricao: "Pão de brioche, mostarda com mel, alface, tomate, cebola roxa, picles, bife de 150g, mussarela e bacon",
        preco: 27.50,
        imagem: "img/x-saladao.jpg"
      },
      {
        nome: "Saturno",
        descricao: "Pão de brioche, molho americano, bife artesanal de 150g, cheddar fatia, catupiry e onion rings",
        preco: 28.00,
        imagem: "img/saturno.jpg"
      },
      {
        nome: "Supremo",
        descricao: "Pão de brioche, molho da casa, alface, tomate, cebola roxa, batata palha, bife artesanal de 150g, cheddar fatia, bacon e catupiry",
        preco: 27.50,
        imagem: "img/supremo.jpg"
      },
      {
        nome: "Cebolão",
        descricao: "Pão de brioche, molho da casa, ovo, bife artesanal de 150g, cheddar fatia, bacon, catupiry e onion rings",
        preco: 28.00,
        imagem: "img/cebolao.jpg"
      },
      {
        nome: "Burg",
        descricao: "Pão de brioche, picles, cebola roxa, molho americano, bife artesanal de 150g, cheddar fatia, bacon e catupiry",
        preco: 28.00,
        imagem: "img/burg.jpg"
      }
    ]
  },
  {
    categoria: "Artesanais de 70g",
    produtos: [
      {
        nome: "Duplo bacon",
        descricao: "Pão de brioche, molho da casa, alface, tomate, 2 bifes artesanais de 70g, mussarela e bacon em dobro",
        preco: 26.50,
        imagem: "img/duplo-bacon.jpg"
      },
      {
        nome: "Ares",
        descricao: "Pão de brioche, molho da casa, alface, tomate, cebola roxa, picles, 2 bifes artesanais de 70g, cheddar fatia e bacon em dobro",
        preco: 26.50,
        imagem: "img/ares.jpg"
      },
      {
        nome: "Cheddar Gourmet",
        descricao: "Pão de brioche, molho da casa, cebola roxa, batata palha, bife artesanal de 70g, cheddar fatia e bacon",
        preco: 19.00,
        imagem: "img/cheddar-gourmet.jpg"
      },
      {
        nome: "Big Cheddar",
        descricao: "Pão, molho americano, batata palha, cebola roxa, 3 bifes de 70g, cheddar fatia e cheddar cremoso",
        preco: 24.00,
        imagem: "img/big-cheddar.jpg"
      }
    ]
  },
  {
    categoria: "Batatas",
    produtos: [
      {
        nome: "Batata com bacon e cheddar",
        descricao: "200g de porção de batata frita com bacon e cheddar",
        preco: 14.00,
        imagem: "img/batata-bacon-cheddar.png"
      },
      {
        nome: "Porção de batata",
        descricao: "Porção de 200g",
        preco: 9.00,
        imagem: "img/batata.jpg"
      },
      {
        nome: "Porção de batata com bacon e catupiry",
        descricao: "Porção de batata frita com bacon e catupiry",
        preco: 14.00,
        imagem: "img/batata-bacon-catupiry.jpeg"
      },
      {
        nome: "Porção de batata com bacon",
        descricao: "200g de batata com bacon",
        preco: 12.00,
        imagem: "img/batata-bacon.webp"
      }
    ]
  }
];
