FROM ubuntu:16.04

# Clone and use a specific commit as we haven't tested it with the latest.
# Prime site-packages so it doesn't have to install everything from scratch
RUN apt-get update && apt-get install -y git vim nano && apt-get install -y curl && git clone https://github.com/sourcelair/xterm.js.git xtermjs && cd xtermjs && git reset --hard ea07bf8f694a6e9714779b19c174e26162c39196 && cd - && curl -sL https://deb.nodesource.com/setup_6.x -o node_install.sh && bash node_install.sh &&  apt-get install -y nodejs libssl-dev libffi-dev python-dev build-essential python-pip && cd xtermjs && npm --silent install && pip install --upgrade pip jmespath-terminal azure-cli && echo "\
_python_argcomplete() {\n\
    local IFS='\v'\n\
    COMPREPLY=( \$(IFS=\"\$IFS\"                   COMP_LINE=\"\$COMP_LINE\"                   COMP_POINT=\"\$COMP_POINT\"                   _ARGCOMPLETE_COMP_WORDBREAKS=\"\$COMP_WORDBREAKS\"                   _ARGCOMPLETE=1                   \"\$1\" 8>&1 9>&2 1>/dev/null 2>/dev/null) )\n\
    if [[ \$? != 0 ]]; then\n\
        unset COMPREPLY\n\
    fi\n\
}\n\
complete -o nospace -F _python_argcomplete \"az\"\n\
" > ~/.bashrc

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
    npm run build --prefix /xtermjs & python -m pip install --no-cache-dir $MODULE_NAMES --no-clean'; echo "\nexport PS1='$ '\n" >> ~/.bashrc; cd /azure-cli; node /xtermjs/demo/app
