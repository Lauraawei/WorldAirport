# Use Miniconda3 as a base image
FROM continuumio/miniconda3

# Set the working directory in the container
WORKDIR /code

# Install system dependencies
RUN apt-get update && apt-get install -y libpoppler-dev libgdal-dev gdal-bin

# Copy the environment file
COPY ENV.yml /code/

# Create the environment and install dependencies
RUN conda env create -f ENV.yml

# Activate the environment and set GDAL_LIBRARY_PATH
RUN echo "source activate awm_env" > ~/.bashrc
ENV PATH /opt/conda/envs/awm_env/bin:$PATH
ENV GDAL_LIBRARY_PATH=/opt/conda/envs/awm_env/lib/libgdal.so

# Copy the current directory contents into the container at /code
COPY . /code/

# Copy the docker-entrypoint.sh script and set permissions
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Copy uWSGI configuration file
COPY uwsgi.ini /app/uwsgi.ini

# Expose port 8000 for the Django app
EXPOSE 8000

# Run the Django development server
CMD ["./wait-for-it.sh", "db:5432", "--", "python", "manage.py", "runserver", "0.0.0.0:8000"]