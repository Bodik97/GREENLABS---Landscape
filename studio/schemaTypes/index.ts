import { blockTypes } from './blocks'
import { teamMember } from './teamMember'
import { project } from './project'
import { post } from './post'
import { service } from './service'
import { serviceItem } from './serviceItem'
import { vacancy } from './vacancy'

export const schemaTypes = [project, post, service, serviceItem, teamMember, vacancy, ...blockTypes]
