FROM ubuntu:16.04

# Clone and use a specific commit as we haven't tested it with the latest.
RUN apt-get update && apt-get install -y git && apt-get install -y curl && git clone https://github.com/sourcelair/xterm.js.git xtermjs && cd xtermjs && git reset --hard ea07bf8f694a6e9714779b19c174e26162c39196 && cd - && curl -sL https://deb.nodesource.com/setup_6.x -o node_install.sh && bash node_install.sh &&  apt-get install -y nodejs libssl-dev libffi-dev python-dev build-essential python-pip && cd xtermjs && npm --silent install && rm -rf /var/lib/apt/lists/* && echo "\
_python_argcomplete() {\n\
    local IFS='\v'\n\
    COMPREPLY=( \$(IFS=\"\$IFS\"                   COMP_LINE=\"\$COMP_LINE\"                   COMP_POINT=\"\$COMP_POINT\"                   _ARGCOMPLETE_COMP_WORDBREAKS=\"\$COMP_WORDBREAKS\"                   _ARGCOMPLETE=1                   \"\$1\" 8>&1 9>&2 1>/dev/null 2>/dev/null) )\n\
    if [[ \$? != 0 ]]; then\n\
        unset COMPREPLY\n\
    fi\n\
}\n\
complete -o nospace -F _python_argcomplete \"az\"\n\
" > ~/.bashrc

# Override demo files with our own
COPY app.js main.js index.html style.css favicon.ico /xtermjs/demo/

# note: The prefix seems to change the directory also so it doesn't start at /azure-cli automatically right now.
CMD sed 's/INSTANCE_TOKEN_PLACEHOLDER/'$INSTANCE_TOKEN'/' -i /xtermjs/demo/index.html; sed 's/INSTANCE_TOKEN_PLACEHOLDER/'$INSTANCE_TOKEN'/' -i /xtermjs/demo/main.js; echo "rm -rf /azure-cli/*  /azure-cli/.*; git clone https://github.com/azure/azure-cli /azure-cli; cd /azure-cli; git fetch origin pull/$PR_NUM/head:pr-$PR_NUM; git checkout pr-$PR_NUM; cd -; TMP_PKG_DIR=\$(mktemp -d); \
    for d in /azure-cli/src/azure-cli /azure-cli/src/azure-cli-core /azure-cli/src/azure-cli-nspkg /azure-cli/src/azure-cli-command_modules-nspkg /azure-cli/src/command_modules/azure-cli-*/; \
    do cd \$d; python setup.py bdist_wheel -d \$TMP_PKG_DIR; cd -; \
    done; \
    MODULE_NAMES=""; \
    for f in \$TMP_PKG_DIR/*; \
    do MODULE_NAMES=\"\$MODULE_NAMES \$f\"; \
    done; \
    python -m pip install --no-cache-dir \$MODULE_NAMES --no-clean; echo Done." >> /usr/bin/refresh; chmod u+x /usr/bin/refresh; npm run build --prefix /xtermjs & bash /usr/bin/refresh; echo "\nexport PS1='\w\$ '\n" >> ~/.bashrc; cd /azure-cli; node /xtermjs/demo/app
