makeLevel = (world, matrix) => {
    const structure = new Structure(matrix.map(row => row.map(cell => cell <= 2 ? cell : 0)));
    world.addEntity(structure);

    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            switch (matrix[row][col]) {
            case 4:
                const cat = new Cat();
                cat.x = (col + 0.5) * CELL_SIZE;
                cat.y = (row + 0.5) * CELL_SIZE;
                world.addEntity(cat);
                world.addEntity(new HUD(cat));

                const camera = new Camera();
                camera.target = cat;
                world.addEntity(camera);
                break;
            case 3:
                const human = new Human();
                human.x = (col + 0.5) * CELL_SIZE;
                human.y = (row + 0.5) * CELL_SIZE;
                world.addEntity(human);
                break;
            }
        }
    }
}
