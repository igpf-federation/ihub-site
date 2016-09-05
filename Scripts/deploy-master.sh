#!/bin/bash

aws s3 sync \
	--exclude "$(cat .s3ignore)" \
	--delete \
	_site/ \
	s3://codogo-nhs-site-ihub-prod/

aws configure set preview.cloudfront true

aws cloudfront create-invalidation \
	--distribution-id E2RE7S1RQBTYFP \
	--paths "/*"
