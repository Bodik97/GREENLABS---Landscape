import { blockTypes } from './blocks'
import { teamMember } from './teamMember'
import { project } from './project'
import { post } from './post'
import { service } from './service'
import { serviceItem } from './serviceItem'

export const schemaTypes = [project, post, service, serviceItem, teamMember, ...blockTypes]
