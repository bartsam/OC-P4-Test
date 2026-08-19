# Yoga App

Application web de réservation de séances de yoga, composée d'un back-end **Spring Boot** (Java 21) sécurisé par JWT et
d'un front-end **Angular**.

## Sommaire

- [Prérequis](#prérequis)
- [Installer et lancer l'application](#installer-et-lancer-lapplication)
- [Lancer les tests](#lancer-les-tests)
- [Générer les rapports de couverture](#générer-les-rapports-de-couverture)
- [Seuils de couverture](#seuils-de-couverture)

---

## Prérequis

- JDK 21
- Maven 3.9.3
- Docker Desktop et Docker Compose
- Node.js et npm
- Angular CLI

---

## Installer et lancer l'application

### Back-end

1. Démarrer Docker Desktop.
2. Se placer sur le répertoire `/back` :

```bash
cd back
```

3. Vérifier que le fichier `back/.env` contient les variables nécessaires à la connexion MySQL et au secret JWT
   (`DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` et `TOKEN_SECRET`).
4. Démarrer l'application et initialiser automatiquement le conteneur Docker MySQL (via `compose.yaml`), en exécutant :

```bash
mvn spring-boot:run
```

5. Vérifier dans Docker Desktop qu'un conteneur `back_mysql` est bien démarré. Le backend est accessible sur
   `http://localhost:8080`.
6. Insérer les données de démarrage (utilisateur admin, enseignant de test) en suivant la procédure détaillée dans
   le [README du back](back/README.md#démarrage-du-back).

### Front-end

1. Se placer sur le répertoire `/front` :

```bash
cd front
```

2. Installer et démarrer le projet :

```bash
npm install
npm run start
```

L'application est disponible sur `http://localhost:4200`.

---

## Lancer les tests

### Back-end : tests unitaires et d'intégration

La commande suivante exécute les tests unitaires et d'intégration. Les tests d'intégration basés sur Testcontainers/MockMvc
nécessitent Docker démarré.

Depuis le répertoire `/back` :

```bash
mvn clean test
```

### Front-end : tests unitaires

Depuis le répertoire `/front` :

```bash
npm run test
```

### Front-end : tests E2E

Les commandes suivantes nécessitent que le backend et le frontend soient déjà démarrés :

Depuis le répertoire `/front`, lancer Cypress :

- en mode interactif :

```bash
npm run cypress:open
```

- en mode headless :

```bash
npm run cypress:run
```

---

## Générer les rapports de couverture

### Back-end : JaCoCo

```bash
mvn clean verify
```

Cette commande génère le rapport de couverture (instructions, branches, lignes) et vérifie le
respect des seuils configurés (voir [Seuils de couverture](#seuils-de-couverture)) : le build échoue si un des seuils
n'est pas atteint pour un package.

Le rapport HTML est disponible sur : `back/target/site/jacoco/index.html`

**Exclusions de couverture** : les packages suivants sont exclus car ils ne contiennent pas de logique métier propre :

- `**/dto/**`, `**/payload/**`, `**/models/**` : objets de transfert de données (DTO/entités), sans comportement à
  tester.
- `**/mapper/TeacherMapperImpl*`, `**/mapper/UserMapperImpl*`, `**/mapper/EntityMapper*` : implémentations MapStruct
  sans expression de mapping personnalisée.

### Front-end : couverture des tests E2E

Les tests E2E doivent être lancés avant de générer leur rapport de couverture :

```bash
npm run e2e
npm run cypress:run
npm run e2e:coverage
```

Le rapport est disponible sur : `front/coverage/cypress/lcov-report/index.html`

### Front-end : couverture des tests unitaires

```bash
npm run test:coverage
```

Le rapport HTML est disponible à : `front/coverage/jest/lcov-report/index.html`

---

## Seuils de couverture

Conformément aux exigences du projet, le seuil minimal de **80 %** est vérifié pour chaque indicateur sur chacune des
parties testées de l'application.

### Back-end

Les seuils sont configurés dans `back/pom.xml`, via l'exécution `jacoco-check` du plugin `jacoco-maven-plugin` :

```xml
  <configuration>
      <rules>
          <rule>
              <element>PACKAGE</element>
              <limits>
                  <limit>
                      <counter>LINE</counter>
                      <value>COVEREDRATIO</value>
                      <minimum>0.8</minimum>
                  </limit>
                  <limit>
                      <counter>BRANCH</counter>
                      <value>COVEREDRATIO</value>
                      <minimum>0.80</minimum>
                  </limit>
                  <limit>
                      <counter>INSTRUCTION</counter>
                      <value>COVEREDRATIO</value>
                      <minimum>0.80</minimum>
                  </limit>
              </limits>
          </rule>
      </rules>
  </configuration>
```

Ces seuils sont vérifiés automatiquement à chaque exécution de `mvn clean verify`.

### Front-end

Les seuils recommandés sont configurer dans `jest.config.js` pour les tests unitaires et les tests d'intégration :

```js
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80
    }
  }
```

Le même seuil de 80 % s'applique au rapport de couverture E2E généré dans `.nycrc`.

```js
  {
    "check-coverage": true,
    "statements": 80,
    "branches": 80,
    "functions": 80,
    "lines": 80
  }
```

Si la couverture descend sous 80 % pour un de ces indicateurs, les commandes de test se terminent en erreur.
