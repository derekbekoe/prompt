FROM ubuntu:16.04

RUN apt-get update
RUN apt-get install -y git vim nano
RUN apt-get install -y curl
# Clone and use a specific commit as we haven't tested it with the latest.
RUN git clone https://github.com/sourcelair/xterm.js.git xtermjs; cd xtermjs; git reset --hard ea07bf8f694a6e9714779b19c174e26162c39196; cd -
# Install xterm, az, jpterm dependencies
RUN curl -sL https://deb.nodesource.com/setup_6.x | bash -
RUN apt-get install -y nodejs curl libssl-dev libffi-dev python-dev build-essential python-pip

# Install xterm
WORKDIR xtermjs
RUN npm --logevel=error install

RUN pip install --upgrade pip jmespath-terminal

WORKDIR /
# Override demo files with our own
ADD app.js /xtermjs/demo/app.js
ADD main.js /xtermjs/demo/main.js
ADD index.html /xtermjs/demo/index.html
ADD style.css /xtermjs/demo/style.css
ADD favicon.ico /xtermjs/demo/favicon.ico

# note: The prefix seems to change the directory also so it doesn't start at /azure-cli automatically right now.
CMD sed 's/INSTANCE_TOKEN_PLACEHOLDER/'$INSTANCE_TOKEN'/' -i /xtermjs/demo/index.html; sed 's/INSTANCE_TOKEN_PLACEHOLDER/'$INSTANCE_TOKEN'/' -i /xtermjs/demo/main.js; git clone https://github.com/azure/azure-cli azure-cli; cd azure-cli; git fetch origin pull/$PR_NUM/head:pr-$PR_NUM; git checkout pr-$PR_NUM; cd -; /bin/bash -c 'TMP_PKG_DIR=$(mktemp -d); \
    for d in azure-cli/src/azure-cli azure-cli/src/azure-cli-core azure-cli/src/azure-cli-nspkg azure-cli/src/azure-cli-command_modules-nspkg azure-cli/src/command_modules/azure-cli-*/; \
    do cd $d; python setup.py bdist_wheel -d $TMP_PKG_DIR; cd -; \
    done; \
    MODULE_NAMES=""; \
    for f in $TMP_PKG_DIR/*; \
    do MODULE_NAMES="$MODULE_NAMES $f"; \
    done; \
    pip install $MODULE_NAMES; \
    pip install --force-reinstall --upgrade azure-nspkg azure-mgmt-nspkg;'; cp azure-cli/packaged_releases/az.completion ~/.bashrc; echo -e "\nexport PS1='$ '\n" >> ~/.bashrc; cd /azure-cli; npm start --prefix /xtermjs