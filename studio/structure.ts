import type { StructureResolver } from 'sanity/structure'
import { CaseIcon } from '@sanity/icons/Case'
import { DocumentTextIcon } from '@sanity/icons/DocumentText'
import { UserIcon } from '@sanity/icons/User'
import { EyeClosedIcon } from '@sanity/icons/EyeClosed'
import { TagIcon } from '@sanity/icons/Tag'
import { ComponentIcon } from '@sanity/icons/Component'

// id обов'язково задаємо явно: з кириличних назв Sanity його не виводить
export const structure: StructureResolver = (S) =>
  S.list()
    .id('root')
    .title('GREENLABS')
    .items([
      S.listItem()
        .id('works')
        .title('Роботи')
        .icon(CaseIcon)
        .child(
          S.list()
            .id('works-list')
            .title('Роботи')
            .items([
              S.listItem()
                .id('works-all')
                .title('Усі роботи')
                .icon(CaseIcon)
                .child(
                  S.documentTypeList('project')
                    .id('works-all-list')
                    .title('Усі роботи')
                    .defaultOrdering([{ field: 'order', direction: 'asc' }]),
                ),
              S.listItem()
                .id('works-hidden')
                .title('Сховані')
                .icon(EyeClosedIcon)
                .child(
                  S.documentTypeList('project')
                    .id('works-hidden-list')
                    .title('Сховані роботи')
                    .filter('_type == "project" && hidden == true'),
                ),
            ]),
        ),
      S.listItem()
        .id('blog')
        .title('Блог')
        .icon(DocumentTextIcon)
        .child(
          S.list()
            .id('blog-list')
            .title('Блог')
            .items([
              S.listItem()
                .id('posts-all')
                .title('Усі статті')
                .icon(DocumentTextIcon)
                .child(
                  S.documentTypeList('post')
                    .id('posts-all-list')
                    .title('Усі статті')
                    .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }]),
                ),
              S.listItem()
                .id('posts-hidden')
                .title('Сховані')
                .icon(EyeClosedIcon)
                .child(
                  S.documentTypeList('post')
                    .id('posts-hidden-list')
                    .title('Сховані статті')
                    .filter('_type == "post" && hidden == true'),
                ),
            ]),
        ),
      S.listItem()
        .id('services')
        .title('Послуги')
        .icon(TagIcon)
        .child(
          S.list()
            .id('services-list')
            .title('Послуги')
            .items([
              S.listItem()
                .id('services-all')
                .title('Розділи послуг')
                .icon(TagIcon)
                .child(
                  S.documentTypeList('service')
                    .id('services-all-list')
                    .title('Розділи послуг')
                    .defaultOrdering([{ field: 'order', direction: 'asc' }]),
                ),
              S.listItem()
                .id('service-items-all')
                .title('Види робіт')
                .icon(ComponentIcon)
                .child(
                  S.documentTypeList('serviceItem')
                    .id('service-items-all-list')
                    .title('Види робіт')
                    .defaultOrdering([{ field: 'order', direction: 'asc' }]),
                ),
              S.listItem()
                .id('service-items-pages')
                .title('Види робіт із власною сторінкою')
                .icon(ComponentIcon)
                .child(
                  S.documentTypeList('serviceItem')
                    .id('service-items-pages-list')
                    .title('Види робіт із власною сторінкою')
                    .filter('_type == "serviceItem" && ownPage == true')
                    .defaultOrdering([{ field: 'order', direction: 'asc' }]),
                ),
            ]),
        ),
      S.divider(),
      S.listItem()
        .id('team')
        .title('Команда')
        .icon(UserIcon)
        .child(
          S.documentTypeList('teamMember')
            .id('team-list')
            .title('Команда')
            .defaultOrdering([{ field: 'order', direction: 'asc' }]),
        ),
    ])
