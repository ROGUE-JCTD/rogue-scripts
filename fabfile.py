from fabric.api import cd, env, execute, local, prefix, put, run, sudo, task
from fabric.operations import put
from fabric.context_managers import settings, hide
from fabric.contrib.files import sed
from subprocess import Popen, PIPE

# This is a fabric file to automate common tasks.
# Before running make sure you have fabric installed (```pip install fabric```)
# To run a command, navigate to this files parent folder and run: fab <task> -H host -u <user> -p <password>
# To ignore known-hosts use the -D option
# See http://docs.fabfile.org/en/1.4.0/usage/fab.html for all fabric options

# Run a task with arguments
# http://docs.fabfile.org/en/latest/usage/fab.html#per-task-arguments
# fab <task>:kwarg=value -H host -u <user> -p <password>

def map_loom_django_dev():
    """
    Creates symlinks need to develop MapLoom in our Django environment
    """
    sudo('rm -rf /var/www/rogue/maploom/*')
    sudo('ln -s /MapLoom/build/* /var/www/rogue/maploom/')
    sudo('rm /var/lib/geonode/rogue_geonode/geoshape/templates/maps/maploom.html')
    sudo('ln -s /MapLoom/build/maploom.html /var/lib/geonode/rogue_geonode/geoshape/templates/maps/maploom.html')

def uninstall_django_16():
    """
    Uninstalls Django 1.6 and installs Django 1.5.5
    """
    sudo('/var/lib/geonode/bin/pip uninstall Django')
    sudo('/var/lib/geonode/bin/pip install Django==1.5.5')

def restart_tomcat():
    """
    Restarts tomcat on the host machine.
    """
    sudo('service tomcat7 restart')


def reprovision(remove_geoserver_data=False, reboot=False):
    """
    Re-provisions a server (runs /opt/chef-run/run.sh)
    """
    if remove_geoserver_data:
        sudo('rm -rf /var/lib/geoserver_data')

    sudo('/bin/bash /opt/chef-run/run.sh')

    if reboot:
        sudo('reboot')




