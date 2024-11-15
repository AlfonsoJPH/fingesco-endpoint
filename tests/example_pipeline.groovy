    pipeline {
        agent any  // Utiliza cualquier agente disponible
        tools {
            nodejs 'NodeJS_23' // Asegúrate de que el nombre coincida con el que configuraste en Jenkins
        }
        stages {
            stage('Checkout') {
                steps {
                    // Clonar el repositorio
                    git branch: 'develop', url: 'https://github.com/AlfonsoJPH/fingesco-endpoint.git'
                }
            }
            stage('Build') {
                steps {
                    // Construir los contenedores usando docker-compose
                    script {
                        sh 'echo $PATH'
                        sh 'npm install; cd tests; docker-compose down; docker-compose up -d --build'
                    }
                }
            }
            stage('Run Tests') {
                steps {
                    // Ejecutar pruebas en los contenedores
                    script {
                        // Aquí puedes añadir los comandos para ejecutar tus pruebas, por ejemplo:
                        sh 'REDIS_HOST=10.242.52.60 npm test'
                    }
                }
            }
            stage('Cleanup') {
                steps {
                    // Detener y eliminar contenedores al finalizar
                    script {
                        sh 'cd tests; docker-compose down'
                    }
                }
            }
        }
        post {
            always {
                // Siempre mostrar los logs de los contenedores
                script {
                    sh 'cd tests; docker-compose logs'
                    sh 'cd tests; docker-compose down'

                }
            }
            success {
                echo 'Pipeline completed successfully!'
            }
            failure {
                echo 'Pipeline failed!'
            }
        }
    }
