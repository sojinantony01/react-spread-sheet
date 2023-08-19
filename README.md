# react-excel-sheet

A quick example of rendering large lists of inputs in table using React JS and Redux

## Getting Started

Input
```
[
  [1,2,3,4,5,"a","b", "d"],
  [1,2,3,4,5,"a","b", "d"],
  [1,2,3,4,5,"a","b", "d"],
  [1,2,3,4,5,"a","b", "d"]
]
```
```
npm install react-excel-sheet

```
## demo
[Live demo](https://sojinantony01.github.io/react-excel-sheet/)

![alt text](https://raw.githubusercontent.com/sojinantony01/react-excel-sheet/master/public/images/Screenshot%20from%202019-06-08%2000-31-31.png)

![alt text](https://raw.githubusercontent.com/sojinantony01/react-excel-sheet/master/public/images/Screenshot%20from%202019-06-08%2000-31-57.png)


```
import React, { Component } from 'react'
import Sheet from 'react-excel-sheet'

const App = () => {
  const [data, setData] = useState([[]])
    return (<div>
      <Sheet
        data={state}
      />
                            
    </div>)
}

export default App;

```
## props


[Sojin Antony](https://github.com/sojinantony01)

## Acknowledgments