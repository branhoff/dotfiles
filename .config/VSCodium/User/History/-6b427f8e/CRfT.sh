#!/bin/bash

wget -P ~/.local/share/fonts https://github.com/ryanoasis/nerd-fonts/releases/download/v3.4.0/IosevkaTerm.zip \
&& cd ~/.local/share/fonts \
&& unzip IosevkaTerm.zip \
&& rm IosevkaTerm.zip \
&& fc-cache -fv

wget -P ~/.local/share/fonts https://github.com/ryanoasis/nerd-fonts/releases/download/v3.4.0/Iosevka.zip \
&& cd ~/.local/share/fonts \
&& unzip Iosevka.zip \
&& rm Iosevka.zip \
&& fc-cache -fv