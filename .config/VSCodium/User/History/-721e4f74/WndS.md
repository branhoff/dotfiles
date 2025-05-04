# dotfiles
Directory contains the dotfiles for my system

## Requirements
Ensure you have the following installed on your system

### Git

### Stow

## Installation
First, checkout the dotfiles repo in you $HOME directory using it
```
$ git clone git@github.com/branhoff/dotfiles.git
$ cd dotfiles
```

then use GNU stow to create symlinks
```
$ stow .
```