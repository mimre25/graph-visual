# GraphVisual
GraphVisual is an educational tool that provides an accessible web interface for students to explore and interact with graph visualizations of real-world data sets.
A variety of modern graph layout algorithms (including animated, fully interactive physics-based simulations) allow users to discover patterns, clusters, and other properties of these data sets, which are drawn from a broad spectrum of fields, including geography, biology, and social networks. 
Users learn how to compare and evaluate different graph visualizations in side-by-side panels, which can be tweaked, deformed, and augmented by various interactions. 
Filtering and selection make even very dense graphs easy to visualize and understand.


## Dependencies
Several libraries were used for the development of GraphVisual.
They are already included in GraphVisual, but for further reference, we link them below.

* Intro JS: https://github.com/usablica/intro.js
* Bootstrap: https://getbootstrap.com/


## Datasets

The used datasets can be found under 'data/'.
The folder 'data/json/' contains the json equivalent for every data set.
The layouts for each dataset can be found under 'data/layouts/json/'.

The two files *graph-info-study.json* and *graph-info-quiz.json* contain the necessary information for every dataset for GraphVisual to read them.

### Adding a Dataset
To add a new dataset, one needs to find the raw data and convert it to json.
The graphFormatConverter.py script under 'data/' can be helpful with that, however, we do not guarantee that it works for all formats and correctly.
Please ensure that the conversion worked out correctly.
GraphVisual uses a 1-indexed format for the ids.

#### Datasets with named nodes
If a dataset has names instead of numbers as node ids, then all the layout files need to have node names as well instead of numbers to prevent errors.

#### Special layouts (eg. Bipartite, Geographical)
The special layouts do not reside in the 'layouts/json' folder but rather in the 'json/' folder.
Their needs to be '<dataset>_positions.json'.
Furthermore, and entry in graph-info-(study|quiz).json needs to be made to name the special layout.
To do this, add an entry named 'layout', a string that contains the name of the layout, to the json object for the dataset.
The example below shows this entry for the Football dataset, which has a Geographical layout.
```
{
    graphName: "football",
    displayName: "Football", 
    ...
    layout: "Geographical",
    preferredLayout: EXTRA_LAYOUT,
  }
```

## Quiz Component
The quiz component can be used to test the knowledge of users with several questions.
The questions can either contain a graph or not and can be of a different kind.
For more information about the question format and how to add them, check the README in the 'quiz-tutorial' folder.

### Running the quiz
To run the quiz, one simply needs to execute 'server/server.py'.
This will host a web server that can communicate to the quiz front end.
The URL is set in server.py and is displayed on the command line.
Please note that this URL will point to the /index.html page, where the study component resides.
To access the quiz, go to the URL followed by /quiz.
``graph-visual.yaml`` is a conda environment containing the necessary packages to run the quiz. 
During start-up, it compiles the quiz from the question files into a json file that is served to the user.
The server stores the results in similar json files, one for each user.
This is done by creating a folder for each user under 'server/db/'.
To allow users to log in for the quiz, an '_auth.json' file needs to exists which looks like this:

```
{
  "username": "<username>",
  "password": "<password>",
  "authd": true
}

```
**Note:** we do not claim that this is a secure/preferred way to store login credentials, this method was just used as a quick and dirty solution for our research study.

This repository contains an example quiz with three questions and an example user.

## Contributors
<sub><sup>_Sorted by join date, alphabetically to break ties_</sup></sub>


* Alexander Mascoli ~ _09/2018-12/2018_
* Ahmed Farag ~ _02/2019-05/2019_
* Kekoa Wong ~ _02/2019-05/2019_
* Kyle Weingartner ~ _04/2019-10/2019_
* Shuzhan Wang ~  _07/2019-08/2019_
* Wenqing Chang ~ _07/2019-08/2019_
* __Project lead__: Martin Imre
* __Advisor__: Chaoli Wang
