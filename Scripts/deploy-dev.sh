#!/bin/bash

aws s3 sync \
	--exclude "$(cat .s3ignore)" \
	_site/ \
	s3://codogo-nhs-site-ihub-dev/$BITBUCKET_BRANCH/
