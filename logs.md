# Logs du projet

```15/04/21 - Tous```
Implémentation du TP1. 
Formulation par les encadrants de diverses idées d'avancement du projet : 
Pistes d'avancement : 
- Gestion du son
- Questions de programmation et d'optimisation du code
- Que faire si la démo est en distanciel ?
- Intégration dans le TP1 de la VR avec gestion du casque et des controllers
    - Utiliser les controllers VR pour pointer vers la poignée, et ouvrir quand on utilise le trigger par exemple
    - Pouvoir s'approcher et pousser physiquement la porte en VR
    - Avoir la main virtuelle qui se met sur la poignée pour ouvrir la porte si on est suffisamment près
- Résolution dépendant de la distance ("COD" équivalent de "COD Unity")
- Eventualité d'un plus gros projet / de quelque chose qui compile tous les PoC unitaires qu'on a faits
- Question de la physique :
    - Essayer les libs Canon.js et MO.js qui ont une interface avec Unity
    - Réimplémenter une physique de base nous-même

```01/04/21 - Tous```
N'étant pas assez à l'aise sur Three.js, nous devons repartir sur les bases et implémenter le TP1 de MOVIE.

```27/03/21 - Jia et Michael```
Recherche sur les minimaps "world in miniature" en Three.js.
--> Il semblerait qu'il n'existe aucun module qui implémente ça et personne n'a rien publié dessus.

```26/03/21 - Michael```
Recherche sur les relations entre objets en Three.js, en particulier pour reproduire l'idée de l'arborescence de Unity où les fils d'un objet subissent les mêmes transformations géométriques que l'objet.
--> Quand on veut créer un solide contenant plusieurs objets par exemple, on crée un *Object3D* (ou *Group*) et cela se fait tout seul.

```25/03/21 - Tous```
On a essayé sans succès de faire tourner les exemples du projet https://github.com/Sean-Bradley/TeleportVR en V009... 

```15/03/21 - Michael```
Recherches sur les input VR. Aura-t-on besoin de SteamVR ? 
--> A priori oui, en tous cas le navigateur dialogue automatiquement avec SteamVR.
--> Sur l'ordi de la V009, ça ne fonctionne que sur Google Chrome (malgré une maj et des changements dans les réglages de Firefox)

```14/03/21 - Michael```
Manipulations de la caméra (calcul de la base attachée...) (ex. 2). Problème : changement d'objet camera lors du passage en RV.

```11/03/21 - Michael```
Clonage du répo three.js et vérification des exemples.

```07/03/21 - Michael```
Manipulation d'un script donné pour se familiariser avec les objets 3D en Three.js (ex.1).